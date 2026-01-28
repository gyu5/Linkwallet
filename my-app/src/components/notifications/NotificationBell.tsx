"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

type Notification = {
  id: string;
  message: string;
  created_at?: string;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error(userError);
          setError("ユーザー情報の取得に失敗しました");
          return;
        }

        const { data, error } = await supabase
          .from("notifications")
          .select("id, message, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error(error);
          setError("通知の取得に失敗しました");
          return;
        }

        setNotifications(data as Notification[]);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      void fetchNotifications();
    }
  }, [open, supabase]);

  return (
    <div className="relative">
      <button
        type="button"
        className="flex justify-end material-symbols-outlined text-4xl! text-green-700"
        onClick={() => setOpen((prev) => !prev)}
      >
        notifications
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto rounded-2xl bg-white shadow-lg border border-gray-200 z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-700">通知</span>
          </div>

          <div className="px-4 py-2 text-xs text-gray-600">
            {loading && <p>読み込み中...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && notifications.length === 0 && (
              <p>現在通知はありません。</p>
            )}
          </div>

          {!loading && !error && notifications.length > 0 && (
            <ul className="px-4 pb-3 space-y-2">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className="text-xs text-gray-800 bg-gray-50 rounded-lg px-3 py-2"
                >
                  {n.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}



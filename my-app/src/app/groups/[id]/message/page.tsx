"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function GroupMessageEditPage() {
  const params = useParams<{ id: string }>();
  const groupId = params?.id;
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessage = async () => {
      if (!groupId) {
        setError("グループIDが取得できませんでした。");
        return;
      }
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setError("ログイン情報が取得できませんでした。");
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("user_groups")
          .select("message")
          .eq("user_id", user.id)
          .eq("group_id", groupId)
          .maybeSingle();

        if (fetchError) {
          console.error(fetchError);
          setError("メッセージの取得に失敗しました。");
          return;
        }

        setMessage((data?.message as string) ?? "");
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [groupId, supabase]);

  const handleSave = async () => {
    if (!groupId) {
      setError("グループIDが取得できませんでした。");
      return;
    }
    if (saving) return;
    setSaving(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("ログイン情報が取得できませんでした。");
        return;
      }

      const { error: updateError } = await supabase
        .from("user_groups")
        .update({ message })
        .eq("user_id", user.id)
        .eq("group_id", groupId);

      if (updateError) {
        console.error(updateError);
        setError("メッセージの更新に失敗しました。");
        return;
      }

      router.push(`/groups/${groupId}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#E6F7EC] flex flex-col items-center px-6 pt-16 pb-24">
      <div className="w-full max-w-md">
        <h1 className="text-xl text-gray-700 mb-6 text-left font-bold">
          メッセージ編集
        </h1>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-4">
          <label className="text-xs text-gray-600">表示メッセージ</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black outline-none focus:ring-1 focus:ring-emerald-400"
            placeholder="ひとことを入力"
            disabled={loading || saving}
          />

          {error && (
            <p className="text-[11px] text-red-600 mt-2">{error}</p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-2 rounded-full border border-gray-300 text-sm text-gray-600"
              disabled={saving}
            >
              戻る
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold"
              disabled={saving}
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}


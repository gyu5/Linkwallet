'use client';

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import Image from "next/image";

export default function AccountPage() {
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [displayName, setDisplayName] = useState("");

  const getInviteCode = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error(error);
      return;
    }
    console.log("data.user_id:", data.user?.id);
    const { data: profileData, error: profileError } = await supabase.from("users").select("invite_code, avatar_url, display_name").eq("id", data.user?.id).single();
    if (profileError) {
      console.error(profileError);
      return;
    }
    console.log("profileData:", profileData);
    setInviteCode(profileData?.invite_code ?? "");
    setAvatarUrl(profileData?.avatar_url ?? "");
    setDisplayName(profileData?.display_name ?? "");
  }
  useEffect(() => {
    getInviteCode();
  }, []);

  const handleCopy = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getUser();
    console.log("data:", data);
    if (error) {
      console.error(error);
      return;
    }

    const { data: profileData, error: profileError } = await supabase.from("users").select("invite_code, avatar_url").eq("id", data.user?.id).single();
    if (profileError) {
      console.error(profileError);
      return;
    }
    try {
      await navigator.clipboard.writeText(profileData?.invite_code ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error(e);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="min-h-screen bg-[#E6F7EC] flex flex-col items-center px-6 pt-16 pb-24">
      {/* ページタイトル */}
      <div className="w-full px-4 mx-auto">
        <h1 className="text-xl text-gray-700 mb-6 text-left font-bold">アカウント</h1>
      </div>

      <div className="w-full max-w-xs space-y-6">
        {/* アカウントカード */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3">
          {/* アイコン丸 */}
          {avatarUrl ? (
            <div className="w-12 h-12 rounded-full border border-gray-300 overflow-hidden bg-white">
              <Image src={avatarUrl} alt="アイコン" width={48} height={48} />
            </div>
          ) : (
            <div className="w-full h-full bg-white" />  // 画像未設定時のプレースホルダ
          )}

          {/* アカウント名 & ID */}
          <div className="flex-1">
            <p className="text-xs text-gray-800 mb-1">{displayName}</p>
            <p className="text-[11px] text-gray-500">
              Invite Code：<span className="tracking-[0.25em]">{inviteCode}</span>
            </p>
          </div>

          {/* コピーアイコンボタン */}
          <button
            type="button"
            onClick={handleCopy}
            aria-label="IDをコピー"
            className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition"
          >
            <span className="material-symbols-outlined text-gray-600 text-lg">
              content_copy
            </span>
          </button>
        </section>

        {copied && (
          <p className="text-[11px] text-green-600 text-right">
            IDをコピーしました
          </p>
        )}

        {/* 検索ボックス（見た目だけ） */}
        <section>
          <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm px-4 py-2">
            <input
              type="text"
              placeholder="ID"
              className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
            />
            <span className="material-symbols-outlined text-gray-500 text-lg">
              search
            </span>
          </div>
        </section>

         {/* プロフィール変更ボタン */}
         <section className="pt-2">
          <button
            type="button"
            // TODO: 実際のプロフィール編集ページのパスに合わせて変更
            onClick={() => (window.location.href = "/account/profile")}
            className="w-full py-2 rounded-full bg-emerald-500 text-white text-sm font-medium shadow-sm active:scale-95 transition"
          >
            プロフィールを編集
          </button>
        </section>
      </div>
    </main>
  );
}
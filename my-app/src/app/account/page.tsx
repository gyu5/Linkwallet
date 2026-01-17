'use client';

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import Image from "next/image";
const DEFAULT_AVATAR = "/default_pfp.jpg"; 


export default function AccountPage() {
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(DEFAULT_AVATAR);
  const [displayName, setDisplayName] = useState("");
  const [friend_invite_code, setFriendInviteCode] = useState("");
  const [friendMessage, setFriendMessage] = useState<string | null>(null);

  const getInviteCode = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error(error);
      return;
    }
    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .select("invite_code, avatar_url, display_name")
      .eq("id", data.user?.id)
      .single();
    if (profileError) {
      console.error(profileError);
      return;
    }

    setInviteCode(profileData?.invite_code ?? "");

    // Google アカウント由来のアイコンは無視して、デフォルトを使う
    const avatar = profileData?.avatar_url as string | null;
    if (avatar && !avatar.includes("lh3.googleusercontent.com")) {
      setAvatarUrl(avatar);
    } else {
      setAvatarUrl(DEFAULT_AVATAR);
    }

    setDisplayName(profileData?.display_name ?? "");
  }
  useEffect(() => {
    getInviteCode();
  }, []);

  const handleCopy = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getUser();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(DEFAULT_AVATAR);

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

  const supabase = createSupabaseBrowserClient();


  // フレンド追加
  const handleAddFriend = async () => {
    setFriendMessage(null);

    // 自分
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      setFriendMessage("ログイン情報が取得できませんでした");
      return;
    }

    // ① invite_code から相手ユーザーを検索
    const { data: target, error: findError } = await supabase
      .from("users")
      .select("id")
      .eq("invite_code", friend_invite_code)
      .maybeSingle();
    console.log("target:", target);

    if (findError || !target) {
      setFriendMessage("その招待コードのユーザーが見つかりません");
      return;
    }
    if (target.id === user.id) {
      setFriendMessage("自分自身は追加できません");
      return;
    }

    // ② 既にフレンドかチェック（user_friends テーブル想定）
    const { data: already } = await supabase
      .from("user_friends")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("friend_id", target.id)
      .maybeSingle();

    if (already) {
      setFriendMessage("すでにフレンドです");
      return;
    }

    // ③ 双方向で 2 行 INSERT
    const { error: insertError } = await supabase
      .from("user_friends")
      .insert([
        { user_id: user.id, friend_id: target.id },
        { user_id: target.id, friend_id: user.id },
      ]);

    if (insertError) {
      console.error(insertError);
      setFriendMessage("フレンド追加に失敗しました");
      return;
    }

    // ④ 通知を作成（notification テーブル）
    const notificationMessage = `${displayName || "だれか"}があなたをフレンドに追加しました`;

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: target.id,
        message: notificationMessage,
      });

    if (notificationError) {
      console.error(notificationError);
      // 通知の保存に失敗してもフレンド追加自体は成功として扱う
    }

    setFriendMessage("フレンドを追加しました");
    setFriendInviteCode("");
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
          <div className="flex items-center bg-white border border-gray-400 rounded-full shadow-sm px-4 py-2">
            <input
              type="text"
              value={friend_invite_code}
              onChange={(e) => setFriendInviteCode(e.target.value)}
              placeholder="ID"
              className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500 text-gray-500"
            />
            <button type="button" onClick={handleAddFriend}>
              <span className="material-symbols-outlined text-gray-500 text-lg">
                search
              </span>
            </button>
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
      {friendMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl px-6 py-4 w-72 shadow-lg">
            <p className="text-sm text-center text-gray-800 mb-4">
              {friendMessage}
            </p>
            <button
              type="button"
              onClick={() => setFriendMessage(null)}
              className="w-full rounded-full bg-emerald-500 text-white text-xs font-semibold py-2 active:scale-95"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
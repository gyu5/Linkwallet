"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";
const DEFAULT_AVATAR = "/default_pfp.jpg"; // なければ好きなデフォルト画像に変更

export default function ProfileEditPage() {
  const [displayName, setDisplayName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(DEFAULT_AVATAR);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const supabase = createSupabaseBrowserClient();
  
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) return;

      const { data: profile } = await supabase
        .from("users")                 // 実際のテーブル名に合わせる
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) return;

      if (profile.display_name) {
        setDisplayName(profile.display_name);
      }
      if (profile.avatar_url) {
        setAvatarPreview(profile.avatar_url);  // ★ 既存アバターを表示
      }
    };

    fetchProfile();
  }, [supabase]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      setSaving(true);

 // 1. ログインユーザー取得
 const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw userError ?? new Error("ログイン情報が取得できませんでした");
  }

  // 2. アバター画像を Storage にアップロード（あれば）
  let avatarUrl: string | null = avatarPreview;

  if (avatarFile) {
    const fileExt = avatarFile.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("user_pf") // ★ 実際のバケット名に合わせて変更
      .upload(filePath, avatarFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // 公開URLを使う場合
    const {
      data: { publicUrl },
    } = supabase.storage.from("user_pf").getPublicUrl(filePath);
    avatarUrl = publicUrl;
  }
  
  for (let i = 0; i < 20; i++) {
    const n = Math.floor(Math.random() * 10000);       // 0〜9999
    const code = n.toString().padStart(4, "0");
    
    const inviteCode = displayName + "#" + code;
  
    const exists = await supabase
      .from("users")
      .select("id")
      .eq("invite_code", inviteCode)
      .maybeSingle();


    if (!exists.data) {
      // この組み合わせは空いてるので採用
      await supabase.from("users").update({ invite_code: inviteCode }).eq("id", user.id);
      break;
    }
  }

      // 3. profiles テーブルを更新
      const { error: updateError } = await supabase
      .from("users") // ★ 実際のテーブル名に合わせて変更
      .update({
        display_name: displayName,
        avatar_url: avatarUrl, // カラム名は実際に合わせて
      })
      .eq("id", user.id); // ユーザーIDで自分の行を更新

    if (updateError) {
      throw updateError;
    }

      console.log("displayName:", displayName);
      console.log("avatarFile:", avatarFile);

      setMessage("プロフィールを更新しました");
    } catch (err) {
      console.error(err);
      setMessage("更新に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#E6F7EC] flex flex-col items-center px-6 pt-16 pb-24">
      {/* タイトル */}
      <div className="w-full px-4 mx-auto">
        <h1 className="text-xl text-gray-700 mb-6 text-left font-bold">プロフィール編集</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs bg-white rounded-2xl shadow-sm border border-gray-200 px-6 py-6 space-y-6"
      >
        {/* プロフィール画像 */}
        <section className="flex flex-col items-center space-y-3">
          <div className="w-24 h-24 rounded-full border border-gray-300 overflow-hidden bg-gray-50">
            {avatarPreview && (
              <Image
                src={avatarPreview}
                alt="プロフィール画像プレビュー"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <label className="text-xs text-emerald-700 font-medium cursor-pointer">
            画像を変更
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
        </section>

        {/* 表示名 */}
        <section className="space-y-1">
          <label className="text-xs text-gray-700">表示名</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="表示名を入力"
            className="w-full border border-gray-700 bg-white rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-400 text-black"
          />
        </section>

        {/* メッセージ */}
        {message && (
          <p className="text-[11px] text-center text-gray-600">{message}</p>
        )}

        {/* 保存ボタン */}
        <button
          type="submit"
          disabled={saving}
          className={`w-full py-2 rounded-full text-sm font-medium text-white shadow-sm ${
            saving
              ? "bg-emerald-300 cursor-not-allowed"
              : "bg-emerald-500 active:scale-95"
          }`}
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </form>
    </main>
  );
}
'use client';

import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  // ボタンを押したときに呼ばれる処理
  const handleLoginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // ログイン完了後に戻したいURL
        redirectTo: `${window.location.origin}/home`,
      },
    });

    if (error) {
      console.error('ログインエラー:', error);
      alert('ログインに失敗しました');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-xl shadow-md">
        <h1 className="text-xl font-semibold">ログイン</h1>

        {/* Google丸ボタン */}
        <button
          onClick={handleLoginWithGoogle}
          className="focus:outline-none hover:scale-105 transition"
          aria-label="Googleでログイン"
        >
          <Image
            src="/google-icon.png"  // public/google-icon.png を用意しておく
            alt="Google"
            width={260}
            height={64}
          />
        </button>
      </div>
    </main>
  );
}
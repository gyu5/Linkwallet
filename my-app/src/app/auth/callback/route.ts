// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
console.log(code);
  if (code) {
    // ① code をセッションに交換して、Cookie に保存してもらう
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error(exchangeError);
      return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_ORIGIN));
    }
  }

  // ② ここまで来たらセッションが Cookie に入っているので、確認したければ getUser
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error(error);
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_ORIGIN));
  }

  // ③ ログイン成功 → 好きなページへ
  return NextResponse.redirect(new URL("/home", process.env.NEXT_PUBLIC_ORIGIN));
}
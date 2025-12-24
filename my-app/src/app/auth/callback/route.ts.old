// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, CookieOptions } from "@supabase/ssr";
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

  // ここで code → セッションへの交換が行われ、上の cookies 経由で
  // sb-access-token / sb-refresh-token などの HttpOnly Cookie がセットされる
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error(error);
    // ログイン失敗扱い
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ログイン成功 → 好きなページへ
  return NextResponse.redirect(new URL("/home", request.url));
}
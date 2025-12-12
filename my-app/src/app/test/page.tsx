// src/app/test/page.tsx
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type GroupRow = {
  group_id: string;
  saving_amount: number;
  groups: {
    id: string;
    display_name: string;
    photo_url: string | null;
    dead_line: string;
  } | null;
};

export default async function TestPage() {
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

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return <pre>{userError.message}</pre>;
  }

  if (!user) {
    return <pre>未ログイン</pre>;
  }

  const { data, error } = await supabase
    .from("user_groups")
    .select(`
    group_id,
    saving_amount,
    groups:group_id (
      id,
      display_name,
      photo_url,
      dead_line
    )
  `)
    .eq("user_id", user.id)
    .returns<GroupRow[]>();


  if (error) {
    return <pre>{error.message}</pre>;
  }

  return (
    <pre>{JSON.stringify({ userId: user.id, groups: data }, null, 2)}</pre>
  );
}

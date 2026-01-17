import TravelCardCarousel from "@/components/TravelCardCarousel";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import NotificationBell from "@/components/notifications/NotificationBell";

type GroupJoined = {
  id: string;
  display_name: string;
  goal_amount: number;
  dead_line?: string;
  created_at?: string;
};

type UserGroupRow = {
  group_id: string;
  saving_amount: number;
  groups: GroupJoined; // ★ 配列ではなくオブジェクト1個
};

type Card = {
  id: string;
  display_name: string;
  progress: number;
  shouldProgress: number;
  goal_amount: number;
  dead_line?: string | null;
  is_regular?: boolean | null;
  currentSaving: number;
};

function calcShouldProgress(startDate?: string | null, endDate?: string | null) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  if (now.getTime() <= start.getTime()) return 0;
  if (now.getTime() >= end.getTime()) return 100;
  const total = end.getTime() - start.getTime();
  if (total <= 0) return 100;
  const elapsed = now.getTime() - start.getTime();
  const ratio = elapsed / total;
  return Math.round(Math.min(Math.max(ratio, 0), 1) * 100);
}

export default async function HomePage() {

  const supabase = await createSupabaseServerClient();
  const user = await supabase.auth.getUser();
  console.log(user);

  if (!user.data.user) {
    redirect("/login");
  }

  const {data, error} = await supabase
    .from("user_groups")
    .select(
      "groups:group_id (id, display_name, goal_amount, dead_line, created_at), group_id, saving_amount, is_regular"
    )
    .eq("user_id", user.data.user?.id)
    .returns<UserGroupRow[]>();

  if (error) {
    console.error(error);
  }
  if (data) {
    console.log(data);
  }


  const groupsForUI = 
    data && data.length > 0 ? data.map((row) => {
      const grp = row.groups as GroupJoined;
      const goal = grp?.goal_amount ?? 0;
      const saving = Math.round(row.saving_amount / goal * 100);
      const shouldProgress = calcShouldProgress(
        grp?.created_at ?? null,
        grp?.dead_line ?? null
      );

      return {
        id: grp?.id ?? row.group_id,    // 念のためフォールバック
        display_name: grp?.display_name ?? "",
        progress: saving,
        shouldProgress,
        goal_amount: goal,
        dead_line: grp?.dead_line ?? null,
        is_regular: (row as any)?.is_regular ?? null,
        currentSaving: Number(row.saving_amount ?? 0),
      };
    }) : [];

  return (
    <div className="min-h-screen bg-[#E6FAF4] flex flex-col items-center">
      <div className="w-full px-4 mt-10 mb-4 flex justify-between items-center">
        <Image src="/logo.png" alt="LinkWallet" width={70} height={70} />
        <NotificationBell />
      </div>

      <TravelCardCarousel groups={groupsForUI as unknown as Card[]} />
    </div>
  );
}

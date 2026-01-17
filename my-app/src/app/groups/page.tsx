import GroupList from "@/components/groups/GroupList";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
//import { cookies } from "next/headers";

/*const groups = [
  { id: 1, name: "9月旅行", progress: 80 },
  { id: 2, name: "バイク", progress: 80 },
  { id: 3, name: "仏僧修行", progress: 80 },
];*/

type GroupJoined = {
  id: string;
  display_name: string;
  goal_amount: number;
  photo_url: string | null;
  dead_line?: string;
  created_at?: string;
};

type UserGroupRow = {
  group_id: string;
  saving_amount: number;
  groups: GroupJoined; // ★ 配列ではなくオブジェクト1個
};

type GroupSavingRow = {
  group_id: string;
  saving_amount: number;
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

export default async function GroupsPage() {
  const supabase = await createSupabaseServerClient();
  const user = await supabase.auth.getUser();
  console.log(user);

  if (!user.data.user) {
    redirect("/login");
  }

  // ログインユーザーが所属するグループ一覧を取得
  const { data, error } = await supabase
    .from("user_groups")
    .select(
      "groups:group_id (id, display_name, goal_amount, photo_url, dead_line, created_at), group_id, saving_amount"
    )
    .eq("user_id", user.data.user?.id)
    .returns<UserGroupRow[]>();

  if (error) {
    console.error(error);
  }
  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen bg-[#E6FAF4] relative pt-8">
        <div className="w-full px-4 mx-auto">
          <h1 className="text-xl text-gray-700 mb-6 text-left font-bold">
            グループ
          </h1>
          <p className="text-sm text-gray-600">まだ参加しているグループがありません。</p>
        </div>
        <Link href="/groups/new_group">
          <button
            aria-label="グループを追加"
            className="
              fixed bottom-24 right-6
              w-16 h-16 rounded-full bg-emerald-600 text-white shadow-lg
              flex items-center justify-center z-50
            "
          >
            <span className="material-symbols-outlined text-3xl">add</span>
          </button>
        </Link>
      </div>
    );
  }

  // このユーザーが所属しているグループID一覧
  const groupIds = Array.from(new Set(data.map((row) => row.group_id)));

  // 各グループの全メンバーの saving_amount を取得
  const { data: allSavings, error: savingsError } = await supabase
    .from("user_groups")
    .select("group_id, saving_amount")
    .in("group_id", groupIds)
    .returns<GroupSavingRow[]>();

  if (savingsError) {
    console.error(savingsError);
  }

  const groupsForUI =
    data && allSavings
      ? data.map((row) => {
          const grp = row.groups as GroupJoined;
          const goal = grp?.goal_amount ?? 0;

          // このグループの全メンバーの saving_amount を集計
          const related = allSavings.filter(
            (s) => s.group_id === row.group_id
          );

          let progress = 0;
          if (related.length > 0 && goal > 0) {
            const totalSaving = related.reduce(
              (sum, s) => sum + Number(s.saving_amount ?? 0),
              0
            );
            const avgSavingPerMember = totalSaving / related.length;
            progress = Math.round((avgSavingPerMember / goal) * 100);
          }

          const shouldProgress = calcShouldProgress(
            grp?.created_at ?? null,
            grp?.dead_line ?? null
          );

          return {
            id: grp?.id ?? row.group_id, // 念のためフォールバック
            name: grp?.display_name ?? "",
            progress,
            shouldProgress,
            photoUrl: grp?.photo_url ?? null,
          };
        })
      : [];

  return (
    <div className="min-h-screen bg-[#E6FAF4] relative pt-8">
      <div className="w-full px-4 mx-auto">
        <h1 className="text-xl text-gray-700 mb-6 text-left font-bold">グループ</h1>
      </div>
      <GroupList groups={groupsForUI || []} />

      {/* 右下の追加ボタン */}
      <Link href="/groups/new_group">
        <button
          aria-label="グループを追加"
          className="
            fixed bottom-24 right-6
            w-16 h-16 rounded-full bg-emerald-600 text-white shadow-lg
            flex items-center justify-center z-50
          "
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </Link>
    </div>
  );
}

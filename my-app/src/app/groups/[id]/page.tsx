// app/groups/[id]/page.tsx
import GroupSummaryCard from "@/components/groups/GroupSummaryCard";
import GroupDetailCard from "@/components/groups/GroupDetailCard";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import Link from "next/link";

type Props = {
  params: {
    id: string;
  };
};

type GroupJoined = {
  id: string;
  display_name: string;
  goal_amount: number;
  dead_line?: string;
  created_at?: string;
  group_id: string;
  saving_amount: number;
  is_regular?: boolean | null;
};

type MemberJoined = {
  user_id: string;
  saving_amount: number;
  message: string | null;
  users: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
};

export default async function GroupDetailPage({ params }: Props) {
  const { id } = await params;
  const groupId = id;

  const supabase = createSupabaseServerClient();

  const user = await supabase.auth.getUser();


  const { data, error } = await supabase
    .from("user_groups")
    .select(
      "groups:group_id (id, display_name, goal_amount, dead_line, created_at), group_id, saving_amount, is_regular"
    )
    .eq("user_id", user.data.user?.id)
    .eq("group_id", groupId)
    .single();

  if (error || !data) {
    // 404 っぽい表示など
    return <div>グループが見つかりませんでした</div>;
  }

  const group = data.groups as unknown as GroupJoined;
  const goal = group?.goal_amount ?? 0;

  const calcShouldProgress = (
    startDate?: string | null,
    endDate?: string | null
  ) => {
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
  };

  const shouldProgress = calcShouldProgress(
    group?.created_at ?? null,
    group?.dead_line ?? null
  );

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("ja-JP");
  };

  const formattedGoal = goal > 0 ? goal.toLocaleString("ja-JP") : "-";
  const formattedDeadline = formatDate(group?.dead_line ?? null);
  const currentSaving = Number(data.saving_amount ?? 0);

  // 他メンバーの進捗取得
  const { data: membersRaw, error: membersError } = await supabase
    .from("user_groups")
    .select(
      `
      user_id,
      saving_amount,
      message,
      users (
        id,
        display_name,
        avatar_url
      )
    `
    )
    .eq("group_id", groupId)
    .returns<MemberJoined[]>();

  if (membersError) {
    console.error(membersError);
  }

  const currentUserId = user.data.user?.id;

  // グループ全体の平均進捗率（％）を計算
  let groupAverageProgress = 0;
  if (membersRaw && membersRaw.length > 0 && goal > 0) {
    const totalSaving = membersRaw.reduce(
      (sum, row) => sum + Number(row.saving_amount ?? 0),
      0
    );
    const avgSavingPerMember = totalSaving / membersRaw.length;
    groupAverageProgress = Math.round((avgSavingPerMember / goal) * 100);
  }

  const membersForUI =
    membersRaw
      ?.map((row) => {
        const u = row.users;
        const memberSaving =
          goal > 0 ? Math.round((row.saving_amount / goal) * 100) : 0;
        return {
          id: u?.id ?? row.user_id,
          name: u?.display_name ?? "名前未設定",
          progress: memberSaving,
          avatarUrl: u?.avatar_url ?? null,
          message: row.message ?? null,
        };
      })
      // currentUser を一番上に、それ以外は元の順序のまま
      .sort((a, b) => {
        if (a.id === currentUserId && b.id !== currentUserId) return -1;
        if (b.id === currentUserId && a.id !== currentUserId) return 1;
        return 0;
      }) ?? [];
  return (
    <div className="min-h-screen bg-[#E6FAF4] pt-6 pb-20">
      {/* 右上の出金ボタン */}
      <div className="flex justify-end px-6 mb-4">
        <Link href={`/points/withdraw/${data.group_id}`}>
          <button
            className="
              rounded-full px-4 py-2
              bg-pink-50 text-pink-500 text-xs
              border border-pink-200 shadow-sm
            "
          >
            出金
          </button>
        </Link>
      </div>

      {/* 目標額と締切 */}
      <div className="w-full max-w-md mx-auto px-4 mb-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 grid grid-cols-3 gap-2 text-sm text-black">
          <div className="flex flex-col">
            <span className="text-gray-500">一人当目標額</span>
            <span className="text-lg font-semibold">{formattedGoal} 円</span>
          </div>
          <div className="flex flex-col text-center">
            <span className="text-gray-500">あなたの現在額</span>
            <span className="text-lg font-semibold">
              {currentSaving.toLocaleString("ja-JP")} 円
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-gray-500">締切</span>
            <span className="text-lg font-semibold">{formattedDeadline}</span>
          </div>
        </div>
      </div>

      {/* 上のグループ概要カード */}
      <GroupSummaryCard
        name={group?.display_name ?? ""}
        progress={groupAverageProgress}
        groupId={groupId}
        shouldProgress={shouldProgress}
        isRegular={data?.is_regular ?? null}
      />

      {/* 下のスライドするカード */}
      <GroupDetailCard
        groupProgress={groupAverageProgress}
        members={membersForUI}
        groupId={groupId}
        currentUserId={currentUserId}
      />
    </div>
  );
}

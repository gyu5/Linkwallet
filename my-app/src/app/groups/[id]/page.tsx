// app/groups/[id]/page.tsx
import GroupSummaryCard from "@/components/groups/GroupSummaryCard";
import GroupDetailCard from "@/components/groups/GroupDetailCard";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

type Props = {
  params: {
    id: string;
  };
};

type GroupJoined = {
  id: string;
  display_name: string;
  goal_amount: number;
  group_id: string;
  saving_amount: number;
};

type MemberJoined = {
  user_id: string;
  saving_amount: number;
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
    .select("groups:group_id (id, display_name, goal_amount), group_id, saving_amount")
    .eq("user_id", user.data.user?.id)
    .eq("group_id", groupId)
    .single();

  if (error || !data) {
    // 404 っぽい表示など
    return <div>グループが見つかりませんでした</div>;
  }

  const group = data.groups as unknown as GroupJoined;
  const goal = group?.goal_amount ?? 0;
  const saving = goal > 0 ? Math.round((data.saving_amount / goal) * 100) : 0;

  // 他メンバーの進捗取得
  const { data: membersRaw, error: membersError } = await supabase
    .from("user_groups")
    .select(
      `
      user_id,
      saving_amount,
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

  const membersForUI =
    membersRaw
      ?.filter((row) => row.user_id !== currentUserId) // 「他のユーザー」のみ
      .map((row) => {
        const u = row.users;
        const memberSaving =
          goal > 0 ? Math.round((row.saving_amount / goal) * 100) : 0;
        return {
          id: u?.id ?? row.user_id,
          name: u?.display_name ?? "名前未設定",
          progress: memberSaving,
          avatarUrl: u?.avatar_url ?? null,
        };
      }) ?? [];
  return (
    <div className="min-h-screen bg-[#E6FAF4] pt-6 pb-20">
      {/* 右上の出金ボタン */}
      <div className="flex justify-end px-6 mb-4">
        <button
          className="
            rounded-full px-4 py-2
            bg-pink-50 text-pink-500 text-xs
            border border-pink-200 shadow-sm
          "
        >
          出金
        </button>
      </div>

      {/* 上のグループ概要カード */}
      <GroupSummaryCard name={group?.display_name ?? ""} progress={saving} />

      {/* 下のスライドするカード */}
      <GroupDetailCard groupProgress={saving} members={membersForUI} />
    </div>
  );
}

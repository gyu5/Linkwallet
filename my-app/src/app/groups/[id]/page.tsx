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

export default async function GroupDetailPage({ params }: Props) {
  const { id } = await params;
  const groupId = id;

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
  .from("user_groups")
  .select("groups:group_id (id, display_name, goal_amount), group_id, saving_amount")
  .eq("group_id", groupId)
  .single();


  if (error || !data) {
    // 404 っぽい表示など
    return <div>グループが見つかりませんでした</div>;
  }
  
  console.log(data);

  const group = data.groups as unknown as GroupJoined;
  const goal = group?.goal_amount ?? 0;
  const saving = Math.round(data.saving_amount / goal * 100);

 


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
      <GroupDetailCard groupProgress={saving} members={[]} />
    </div>
  );
}

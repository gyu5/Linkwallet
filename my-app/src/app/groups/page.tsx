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
};

type UserGroupRow = {
  group_id: string;
  saving_amount: number;
  groups: GroupJoined; // ★ 配列ではなくオブジェクト1個
};

export default async function GroupsPage() {
  const supabase = await createSupabaseServerClient();
  const user = await supabase.auth.getUser();
  console.log(user);

  if (!user.data.user) {
    redirect("/login");
  }

  const {data, error} = await supabase
  .from("user_groups")
  .select("groups:group_id (id, display_name, goal_amount), group_id, saving_amount")
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

      return {
        id: grp?.id ?? row.group_id,    // 念のためフォールバック
        name: grp?.display_name ?? "",
        progress: saving,
      };
    }) : [];

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

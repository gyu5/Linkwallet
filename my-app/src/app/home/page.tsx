import TravelCardCarousel from "@/components/TravelCardCarousel";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

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

type Card = {
  id: string;
  display_name: string;
  progress: number;
};

export default async function HomePage() {

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
        display_name: grp?.display_name ?? "",
        progress: saving,
      };
    }) : [];

  return (
    <div className="min-h-screen bg-[#E6FAF4] flex flex-col items-center">
      <div className="w-full px-4 mt-10 mb-4 flex justify-between items-center">
        <Image src="/logo.png" alt="LinkWallet" width={70} height={70} />
        <span className="flex justify-end material-symbols-outlined text-4xl! text-green-700">notifications</span>
      </div>

      <TravelCardCarousel groups={groupsForUI as unknown as Card[]} />
    </div>
  );
}

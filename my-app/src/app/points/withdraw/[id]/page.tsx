// app/points/withdraw/[id]/page.tsx
import WithdrawScreen from "@/components/points/withdraw/WithdrawScreen";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

const destination = {
  bankName: "〇〇銀行",
  branchName: "××支店",
  accountType: "普通",
  accountNumber: "123456",
  holderName: "チョキン　タロウ",
};

export default async function WithdrawPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // id には group_id が入っている前提で、そのグループでの自分の saving_amount を取得
  const { data, error } = await supabase
    .from("user_groups")
    .select("saving_amount")
    .eq("user_id", user.id)
    .eq("group_id", id)
    .maybeSingle();

  if (error || !data) {
    // 対応するレコードがなければグループ一覧へ戻す
    redirect("/groups");
  }

  const points = Number(data.saving_amount ?? 0);

  return (
    <WithdrawScreen
      points={points}
      destination={destination}
      groupId={id}
    />
  );
}


// app/points/purchase/page.tsx
import PurchaseForm from "@/components/points/PurchaseForm";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function PointsPurchasePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("groups")
    .select("display_name")
    .eq("id", id)
    .single();
  if (error) {
    console.error(error);
  }

  return (
    <PurchaseForm
      goalName={data?.display_name ?? ""}
      groupId={id}
    />
  );
}

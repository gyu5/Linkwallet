// app/points/purchase/page.tsx
import PurchaseForm from "@/components/points/PurchaseForm";

export default function PointsPurchasePage() {
  // 本番はURLから取得する
  const goalName = "9月旅行";

  return <PurchaseForm goalName={goalName} />;
}

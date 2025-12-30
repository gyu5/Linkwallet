// components/points/PurchaseForm.tsx
"use client";

import { useState } from "react";
import PurchaseHeader from "./PurchaseHeader";
import AmountInput from "./AmountInput";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

type PurchaseFormProps = {
  goalName: string;
  groupId: string;
};

type PopupState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

export default function PurchaseForm({ goalName, groupId }: PurchaseFormProps) {
  const [amount, setAmount] = useState("");
  const [popup, setPopup] = useState<PopupState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const handleConfirm = async () => {
    if (!amount) {
      setPopup({
        type: "error",
        message: "金額を入力してください。",
      });
      return;
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setPopup({
        type: "error",
        message: "金額は0より大きい数値を入力してください。",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // ログインユーザー取得
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(userError);
        setPopup({
          type: "error",
          message: "ログイン情報の取得に失敗しました。",
        });
        return;
      }

      // 現在の saving_amount を取得
      const { data: row, error: fetchError } = await supabase
        .from("user_groups")
        .select("saving_amount")
        .eq("user_id", user.id)
        .eq("group_id", groupId)
        .maybeSingle();

      if (fetchError) {
        console.error(fetchError);
        setPopup({
          type: "error",
          message: "現在の貯金額の取得に失敗しました。",
        });
        return;
      }

      if (!row) {
        setPopup({
          type: "error",
          message: "このグループに参加していないため、貯金できません。",
        });
        return;
      }

      const currentSaving = Number(row.saving_amount ?? 0);
      const newSaving = currentSaving + numericAmount;

      console.log("currentSaving", currentSaving);
      console.log("newSaving", newSaving);
      console.log("groupId", groupId);
      console.log("user.id", user.id);

      const { error: updateError } = await supabase
        .from("user_groups")
        .update({ saving_amount: newSaving })
        .eq("user_id", user.id)
        .eq("group_id", groupId);

      if (updateError) {
        console.error(updateError);
        setPopup({
          type: "error",
          message: "貯金額の更新に失敗しました。",
        });
        return;
      }

      setPopup({
        type: "success",
        message: "ポイントの購入が完了しました。",
      });
    } catch (e) {
      console.error(e);
      setPopup({
        type: "error",
        message: "ネットワークエラーが発生しました。通信状況を確認してください。",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleConfirm();
  };

  const closePopup = () => setPopup(null);

  return (
    <div className="min-h-screen bg-[#E6FAF4]">
      <PurchaseHeader onConfirm={handleConfirm} />

      <form onSubmit={handleSubmit} className="mt-4">
        {/* 「9月旅行 に」の部分 */}
        <div className="px-6 mb-8 text-black">
          <p className="text-3xl font-semibold">
            {goalName} <span className="text-2xl align-middle">に</span>
          </p>
        </div>

        <AmountInput amount={amount} onChange={setAmount} />

        {/* フォーム下に送信中の簡易表示（必要なら） */}
        {isSubmitting && (
          <p className="mt-4 text-center text-xs text-gray-600">
            購入処理中です…
          </p>
        )}
      </form>

      {/* 成功／失敗ポップアップ */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-72 rounded-2xl bg-white px-6 py-5 text-center shadow-lg">
            <p
              className={`mb-4 text-sm font-medium ${
                popup.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {popup.message}
            </p>
            <button
              type="button"
              onClick={closePopup}
              className="w-full rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow-sm"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

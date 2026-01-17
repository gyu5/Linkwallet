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
  const [isRegular, setIsRegular] = useState(false); // false: 一回のみ, true: 定期
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

      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("goal_amount")
        .eq("id", groupId)
        .single();

      const oldstage = Math.floor(currentSaving / groupData?.goal_amount * 100 / 12.5);
      const newstage = Math.floor(newSaving / groupData?.goal_amount * 100 / 12.5);

      // ステージが1つ以上進んだとき、グループの他メンバーに通知を送る
      if (oldstage !== newstage) {
        // このグループに所属する全メンバーを取得
        const { data: members, error: membersError } = await supabase
          .from("user_groups")
          .select("user_id")
          .eq("group_id", groupId);

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("display_name")
          .eq("id", user.id)
          .single();

        if (membersError) {
          console.error(membersError);
        } else if (members && members.length > 0) {
          // 自分以外のメンバーに対して通知レコードを作成
          const notificationRows = members
            .filter((m) => m.user_id !== user.id)
            .map((m) => ({
              user_id: m.user_id,
              message: `${userData?.display_name}の貯金額が${newstage}段階に達しました。`,
            }));

          if (notificationRows.length > 0) {
            const { error: notificationsError } = await supabase
              .from("notifications")
              .insert(notificationRows);

            if (notificationsError) {
              console.error(notificationsError);
            }
          }
        }
      }

      console.log("currentSaving", currentSaving);
      console.log("newSaving", newSaving);
      console.log("groupId", groupId);
      console.log("user.id", user.id);

      const { error: updateError } = await supabase
        .from("user_groups")
        .update({ saving_amount: newSaving, is_regular: isRegular })
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

        {/* 一回のみ / 定期 の選択 */}
        <div className="px-6 mt-6 text-black">
          <div className="flex gap-3">
            {[
              { label: "一回のみ", value: false },
              { label: "定期(毎月)", value: true },
            ].map((opt) => {
              const active = isRegular === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setIsRegular(opt.value)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm flex items-center justify-between ${
                    active
                      ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                      : "border-gray-300 text-gray-700 bg-white"
                  }`}
                >
                  <span>{opt.label}</span>
                  <span
                    className={`material-symbols-outlined text-base ${
                      active ? "text-emerald-500" : "text-gray-300"
                    }`}
                  >
                    check_circle
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 支払い方法（モック：PayPay QR決済） */}
        <div className="px-6 mt-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3">
            <p className="text-xs font-semibold text-gray-600 mb-3">
              入金元
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-red-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">P</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800">
                    P⚪︎yPay Wallet
                  </span>
                  <span className="text-[10px] text-gray-500">
                    オンライン決済
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-emerald-500 text-lg">
                check_circle
              </span>
            </div>
          </div>
        </div>

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

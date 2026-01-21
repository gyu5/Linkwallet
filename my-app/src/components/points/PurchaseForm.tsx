// components/points/PurchaseForm.tsx
"use client";

import { useEffect, useState } from "react";
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
  const [payMethod, setPayMethod] = useState<
    "qr" | "bank" | "merpay" | "dbarai"
  >("qr");
  const [regularInfo, setRegularInfo] = useState<{
    perPayment: number;
    remaining: number;
    count: number;
    deadline: string;
  } | null>(null);
  const [regularError, setRegularError] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  const countMonthlyPayments = (now: Date, deadline: Date) => {
    if (deadline.getTime() < now.getTime()) return 0;
    let count = 0;
    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );
    let cursor = now.getTime() <= currentMonthStart.getTime()
      ? currentMonthStart
      : new Date(now.getFullYear(), now.getMonth() + 1, 1);
    while (cursor.getTime() <= deadline.getTime()) {
      count += 1;
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
    return count;
  };

  useEffect(() => {
    const fetchRegularInfo = async () => {
      if (!isRegular) {
        setRegularInfo(null);
        setRegularError(null);
        return;
      }

      try {
        setRegularError(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setRegularError("ログイン情報が取得できませんでした。");
          return;
        }

        const [{ data: group }, { data: userGroup }] = await Promise.all([
          supabase
            .from("groups")
            .select("goal_amount, dead_line")
            .eq("id", groupId)
            .maybeSingle(),
          supabase
            .from("user_groups")
            .select("saving_amount")
            .eq("user_id", user.id)
            .eq("group_id", groupId)
            .maybeSingle(),
        ]);

        const goalAmount = Number(group?.goal_amount ?? 0);
        const savingAmount = Number(userGroup?.saving_amount ?? 0);
        const deadlineRaw = group?.dead_line as string | null | undefined;

        if (!deadlineRaw || goalAmount <= 0) {
          setRegularError("目標額または締切が設定されていません。");
          return;
        }

        const deadline = new Date(deadlineRaw);
        if (Number.isNaN(deadline.getTime())) {
          setRegularError("締切の日付が不正です。");
          return;
        }

        const remaining = Math.max(goalAmount - savingAmount, 0);
        const count = countMonthlyPayments(new Date(), deadline);

        if (count <= 0) {
          setRegularError("期日までに貯金できる回数がありません。");
          return;
        }

        const perPayment = Math.ceil(remaining / count);
        setRegularInfo({
          perPayment,
          remaining,
          count,
          deadline: deadline.toLocaleDateString("ja-JP"),
        });
        setAmount(String(perPayment));
      } catch (e) {
        console.error(e);
        setRegularError("定期計算に失敗しました。");
      }
    };

    void fetchRegularInfo();
  }, [isRegular, groupId, supabase]);

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

        {/* 定期の計算結果 */}
        {isRegular && (
          <div className="px-6 mt-4 text-black">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 text-xs">
              <p className="font-semibold text-gray-700 mb-1">定期貯金</p>
              {regularError ? (
                <p className="text-red-500">{regularError}</p>
              ) : regularInfo ? (
                <div className="space-y-1 text-gray-700">
                  <p>
                    締切: {regularInfo.deadline} / 残り{regularInfo.count}
                    回
                  </p>
                  <p className="text-sm font-semibold text-black">
                    1回あたり {regularInfo.perPayment.toLocaleString("ja-JP")}
                    円
                  </p>
                  <p className="text-[10px] text-gray-500">
                    残額 {regularInfo.remaining.toLocaleString("ja-JP")} 円を
                    月初に分割
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">計算中...</p>
              )}
            </div>
          </div>
        )}

        {/* 支払い方法（モック） */}
        <div className="px-6 mt-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3">
            <p className="text-xs font-semibold text-gray-600 mb-3">入金元</p>
            <div className="flex flex-col gap-3">
              {/* QRコード決済 */}
              <button
                type="button"
                onClick={() => setPayMethod("qr")}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left ${
                  payMethod === "qr"
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-red-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">P</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800">
                      PayPay Wallet
                    </span>
                    <span className="text-[10px] text-gray-500">
                      オンライン決済
                    </span>
                  </div>
                </div>
                <span
                  className={`material-symbols-outlined text-lg ${
                    payMethod === "qr" ? "text-emerald-500" : "text-gray-300"
                  }`}
                >
                  check_circle
                </span>
              </button>

              {/* メルペイ */}
              <button
                type="button"
                onClick={() => setPayMethod("merpay")}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left ${
                  payMethod === "merpay"
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-yellow-400 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">m</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800">
                      メルペイ
                    </span>
                    <span className="text-[10px] text-gray-500">
                      オンライン決済（モック）
                    </span>
                  </div>
                </div>
                <span
                  className={`material-symbols-outlined text-lg ${
                    payMethod === "merpay" ? "text-emerald-500" : "text-gray-300"
                  }`}
                >
                  check_circle
                </span>
              </button>

              {/* d払い */}
              <button
                type="button"
                onClick={() => setPayMethod("dbarai")}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left ${
                  payMethod === "dbarai"
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-red-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">d</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800">
                      d払い
                    </span>
                    <span className="text-[10px] text-gray-500">
                      オンライン決済（モック）
                    </span>
                  </div>
                </div>
                <span
                  className={`material-symbols-outlined text-lg ${
                    payMethod === "dbarai" ? "text-emerald-500" : "text-gray-300"
                  }`}
                >
                  check_circle
                </span>
              </button>

              {/* 銀行口座 */}
              <button
                type="button"
                onClick={() => setPayMethod("bank")}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left ${
                  payMethod === "bank"
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-slate-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-white">
                      account_balance
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-800">
                      銀行口座
                    </span>
                    <span className="text-[10px] text-gray-500">
                      口座引き落とし（モック）
                    </span>
                  </div>
                </div>
                <span
                  className={`material-symbols-outlined text-lg ${
                    payMethod === "bank" ? "text-emerald-500" : "text-gray-300"
                  }`}
                >
                  check_circle
                </span>
              </button>
              
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

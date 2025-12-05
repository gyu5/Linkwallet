// components/points/PurchaseForm.tsx
"use client";

import { useState } from "react";
import PurchaseHeader from "./PurchaseHeader";
import AmountInput from "./AmountInput";

type PurchaseFormProps = {
  goalName: string;
};

type PopupState =
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | null;

export default function PurchaseForm({ goalName }: PurchaseFormProps) {
  const [amount, setAmount] = useState("");
  const [popup, setPopup] = useState<PopupState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!amount) {
      setPopup({
        type: "error",
        message: "金額を入力してください。",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // TODO: 実際のバックエンドのエンドポイントとパラメータに合わせて修正してください
      const res = await fetch("/api/points/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goalName,
          amount: Number(amount),
        }),
      });

      if (!res.ok) {
        // ステータスコード的に失敗
        setPopup({
          type: "error",
          message: "購入処理に失敗しました。時間をおいて再度お試しください。",
        });
        return;
      }

      // バックエンドが JSON で結果を返す想定
      const data = await res.json().catch(() => ({}));

      const isSuccess =
        data.success !== undefined ? Boolean(data.success) : true;

      if (isSuccess) {
        setPopup({
          type: "success",
          message: "ポイントの購入が完了しました。",
        });
      } else {
        setPopup({
          type: "error",
          message:
            data.message ??
            "購入処理に失敗しました。時間をおいて再度お試しください。",
        });
      }
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

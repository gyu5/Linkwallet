// components/withdraw/ResultDialog.tsx
"use client";

type ResultStatus = "success" | "error" | null;

type Props = {
  status: ResultStatus;
  onClose: () => void;
};

export default function ResultDialog({ status, onClose }: Props) {
  if (!status) return null;

  const title = status === "success" ? "出金が完了しました" : "出金に失敗しました";
  const message =
    status === "success"
      ? "指定した口座に振り込み処理を行いました。"
      : "通信エラーが発生しました。時間をおいて再度お試しください。";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl px-6 py-5 w-72 shadow-lg">
        <h2 className="text-base font-semibold mb-2 text-center text-black">{title}</h2>
        <p className="text-xs text-gray-700 mb-4 text-center text-black">{message}</p>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-emerald-500 text-white text-sm shadow"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

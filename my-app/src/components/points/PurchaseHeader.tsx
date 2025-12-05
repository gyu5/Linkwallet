// components/points/PurchaseHeader.tsx
"use client";

type PurchaseHeaderProps = {
  onConfirm?: () => void;
};

export default function PurchaseHeader({ onConfirm }: PurchaseHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 pt-6 mb-10">
      {/* 左側は空けてタイトルを中央寄せ風に */}
      <div className="w-16" />

      <h1 className="text-base font-medium text-center flex-1 text-black">
        ポイント購入
      </h1>

      <div className="w-16 flex justify-end">
        <button type="button" onClick={onConfirm} className="rounded-full px-1 py-2 bg-purple-50 text-purple-600 text-xs border border-purple-200 shadow-sm">
          購入決定
        </button>
      </div>
    </header>
  );
}

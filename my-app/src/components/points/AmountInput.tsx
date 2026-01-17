// components/points/AmountInput.tsx
"use client";

type AmountInputProps = {
  amount: string;
  onChange: (value: string) => void;
};

export default function AmountInput({ amount, onChange }: AmountInputProps) {
  return (
    <div className="px-6">
      {/* 目標名の下に表示するフォーム部分 */}
      <label className="block mb-10 text-black">
        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-2xl border border-gray-700 bg-white px-6 pr-14 py-4 text-2xl outline-none"
          />
          <span
            className=" absolute inset-y-0 right-5 flex items-center text-lg text-black"
          >
            円
          </span>
        </div>
      </label>

      <div className="flex justify-end pr-2">
        <span className="text-lg font-medium text-black">貯める</span>
      </div>
    </div>
  );
}

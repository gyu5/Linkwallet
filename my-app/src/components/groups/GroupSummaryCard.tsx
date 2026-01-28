// components/groups/GroupSummaryCard.tsx
import Link from "next/link";

type GroupSummaryCardProps = {
  name: string;
  progress: number; // 0–100
  groupId: string;
  shouldProgress?: number;
  isRegular?: boolean | null;
};

export default function GroupSummaryCard({
  name,
  progress,
  groupId,
  shouldProgress,
  isRegular,
}: GroupSummaryCardProps) {
  const markerPos =
    typeof shouldProgress === "number"
      ? Math.min(Math.max(shouldProgress, 0), 100)
      : null;

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="relative bg-[#F5F5F5] rounded-2xl border border-gray-300 shadow-sm px-6 py-5">
        {isRegular && (
          <span className="absolute top-3 right-3 text-xs font-bold text-orange-700 bg-orange-100 border border-orange-200 px-3 py-1 rounded-full">
            定期
          </span>
        )}
        <div className="text-2xl font-semibold mb-4 text-black">{name}</div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500"
              style={{ width: `${progress}%` }}
            />
            {markerPos !== null && (
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-red-500/70"
                style={
                  markerPos >= 100
                    ? { right: 0 }
                    : { left: `${markerPos}%` }
                }
                aria-label="期日ペース"
              />
            )}
          </div>
          <div className="text-xl font-bold text-black">{progress}%</div>
        </div>

        {/* 貯金ボタン（Home のカードと同じ導線） */}
        <div className="mt-4 flex justify-center">
          <Link href={`/points/purchase/${groupId}`}>
            <button className="px-6 py-2 rounded-full border border-white-200 text-xs text-white-500 bg-red-500">
              貯金する
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

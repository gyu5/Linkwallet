// components/groups/GroupSummaryCard.tsx
type GroupSummaryCardProps = {
    name: string;
    progress: number; // 0–100
  };
  
  export default function GroupSummaryCard({
    name,
    progress,
  }: GroupSummaryCardProps) {
    return (
      <div className="w-full max-w-md mx-auto px-4">
        <div className="bg-[#F5F5F5] rounded-2xl border border-gray-300 shadow-sm px-6 py-5">
          <div className="text-2xl font-semibold mb-4 text-black">{name}</div>
  
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xl font-bold text-black">{progress}%</div>
          </div>
        </div>
      </div>
    );
  }
  
// components/groups/GroupRow.tsx
type Group = {
    id: number;
    name: string;
    progress: number;
  };
  
  export default function GroupRow({ group }: { group: Group }) {
    return (
      <div className="border-b border-gray-300 py-4 flex items-center gap-4">
        {/* 左の丸アイコン */}
        <div className="w-12 h-12 rounded-full border border-gray-700 bg-white" />
  
        {/* テキスト＋進捗バー */}
        <div className="flex-1">
          <div className="text-base mb-2 text-black">{group.name}</div>
  
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${group.progress}%` }}
              />
            </div>
            <div className="text-xs text-black">{group.progress}%</div>
          </div>
        </div>
      </div>
    );
  }

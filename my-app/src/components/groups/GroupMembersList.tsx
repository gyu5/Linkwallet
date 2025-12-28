// components/groups/GroupMembersList.tsx
type Member = {
  id: string;
  name: string;
  progress: number;
  avatarUrl?: string | null;
};

type GroupMembersListProps = {
  members: Member[];
};

export default function GroupMembersList({ members }: GroupMembersListProps) {
  return (
    <div className="divide-y divide-gray-300">
      {members.map((m) => (
        <div key={m.id} className="flex items-center gap-3 py-3">
          {/* 左の丸アイコン（ユーザー画像） */}
          <div className="w-9 h-9 rounded-full border border-gray-700 bg-white overflow-hidden flex items-center justify-center">
            {m.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.avatarUrl}
                alt={m.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[10px] text-gray-700">
                {m.name.at(0)}
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="text-sm mb-1 text-black">{m.name}</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${m.progress}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-700">
                {m.progress}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

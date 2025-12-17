// components/groups/GroupList.tsx
import GroupRow from "./GroupRow";

type Group = {
  id: string;
  name: string;
  progress: number;
};

export default function GroupList({ groups }: { groups: Group[] }) {
  return (
    <div className="px-6">
      <div className="border-t border-gray-300">
        {groups.map((g) => (
          <GroupRow key={g.id} group={g} />
        ))}
      </div>
    </div>
  );
}

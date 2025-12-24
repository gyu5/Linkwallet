// components/groups/GroupList.tsx
import GroupRow from "./GroupRow";
import Link from "next/link";

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
          <Link href={`/groups/${g.id}`} key={g.id}>
            <GroupRow group={g} />
          </Link>
        ))}
      </div>
    </div>
  );
}

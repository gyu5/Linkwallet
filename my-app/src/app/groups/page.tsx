// app/groups/page.tsx
import GroupList from "@/components/groups/GroupList";

const groups = [
  { id: 1, name: "9月旅行", progress: 80 },
  { id: 2, name: "バイク", progress: 80 },
  { id: 3, name: "仏僧修行", progress: 80 },
];

export default function GroupsPage() {
  return (
    <div className="min-h-screen bg-[#E6FAF4] relative pt-8">
      <GroupList groups={groups} />

      {/* 右下の追加ボタン */}
      <button
        aria-label="グループを追加"
        className="
          fixed bottom-24 right-6
          w-16 h-16 rounded-full bg-emerald-600 text-white shadow-lg
          flex items-center justify-center z-50
        "
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
}

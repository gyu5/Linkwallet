// components/groups/GroupDetailCard.tsx
"use client";

import GroupMembersList from "./GroupMembersList";

type Member = {
  id: string;
  name: string;
  progress: number;
  avatarUrl?: string | null;
  message?: string | null;
};

type GroupDetailCardProps = {
  groupProgress: number;
  members: Member[];
  groupId: string;
  currentUserId?: string;
};

function getTreeImage(progress: number) {
  if (progress < 12.5) return "/tree/tree_seichou01.png";
  if (progress < 25) return "/tree/tree_seichou02.png";
  if (progress < 37.5) return "/tree/tree_seichou03.png";
  if (progress < 50) return "/tree/tree_seichou04.png";
  if (progress < 62.5) return "/tree/tree_seichou05.png";
  if (progress < 75) return "/tree/tree_seichou06.png";
  if (progress < 87.5) return "/tree/tree_seichou07.png";
  if (progress < 100) return "/tree/tree_seichou08.png";
  return "/tree/tree_seichou09.png";
}

export default function GroupDetailCard({
  groupProgress,
  members,
  groupId,
  currentUserId,
}: GroupDetailCardProps) {
  const treeImage = getTreeImage(groupProgress);

  return (
    <div className="w-full max-w-md mx-auto px-4 mt-4">
      <div className="bg-[#F5F5F5] rounded-2xl border border-gray-300 shadow-sm px-4 py-4">
        {/* 上：木の画像 */}
        <div className="flex items-center justify-center h-48 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={treeImage}
            alt="tree"
            className="max-h-full object-contain"
          />
        </div>

        {/* セパレーター */}
        <div className="h-px bg-gray-300 mb-4" />

        {/* 下：メンバー一覧 */}
        <div className="max-h-56 overflow-y-auto">
          <GroupMembersList
            members={members}
            groupId={groupId}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  );
}

// components/groups/GroupDetailCard.tsx
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import GroupMembersList from "./GroupMembersList";

type Member = {
  id: number;
  name: string;
  progress: number;
};

type GroupDetailCardProps = {
  groupProgress: number;
  members: Member[];
};

function getTreeImage(progress: number) {
  if (progress < 0.125) return "tree/tree_seichou01.png";
  if (progress < 0.25) return "tree/tree_seichou02.png";
  if (progress < 0.375) return "tree/tree_seichou03.png";
  if (progress < 0.5) return "tree/tree_seichou04.png";
  if (progress < 0.625) return "tree/tree_seichou05.png";
  if (progress < 0.75) return "tree/tree_seichou06.png";
  if (progress < 0.875) return "tree/tree_seichou07.png";
  return "tree/tree_seichou08.png";
}

export default function GroupDetailCard({
  groupProgress,
  members,
}: GroupDetailCardProps) {
  const treeImage = getTreeImage(groupProgress);

  return (
    <div className="w-full max-w-md mx-auto px-4 mt-4">
      {/* カードの枠は共通で中身だけスライド */}
      <div className="bg-[#F5F5F5] rounded-2xl border border-gray-300 shadow-sm px-4 py-4">
        <Swiper
          modules={[Pagination]}
          slidesPerView={1}
          pagination={{ clickable: true }}
          className="pb-6"
        >
          {/* スライド1：木の画像 */}
          <SwiperSlide>
            <div className="flex items-center justify-center h-48">
              <img
                src={treeImage}
                alt="tree"
                className="max-h-full object-contain"
              />
            </div>
          </SwiperSlide>

          {/* スライド2：メンバー一覧 */}
          <SwiperSlide>
            <div className="h-48 overflow-y-auto">
              <GroupMembersList members={members} />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}

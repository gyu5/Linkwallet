"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/pagination";
import Link from "next/link";

type Card = {
  id: string;
  display_name: string;
  progress: number;
};

export default function TravelCardCarousel({groups}: {groups: Card[]}) {
  return (
    <div className="flex justify-center pt-8">
      {/* 画面幅に合わせて広がるが、最大幅は制限して「ちょうどよく」見せる */}
      <div className="w-full max-w-sm px-4">
        <Swiper
          modules={[Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          pagination={{ clickable: true }}
          className="pb-8"
        >
          {groups.map((card: Card, idx: number) => (
            <SwiperSlide key={idx}>
              <TravelCard group={card} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

function getTreeImage(progress: number) {
  if (progress <= 12.5) return "tree/tree_seichou01.png";
  if (progress <= 25) return "tree/tree_seichou02.png";
  if (progress <= 37.5) return "tree/tree_seichou03.png";
  if (progress <= 50) return "tree/tree_seichou04.png";
  if (progress <= 62.5) return "tree/tree_seichou05.png";
  if (progress <= 75) return "tree/tree_seichou06.png";
  if (progress <= 87.5) return "tree/tree_seichou07.png";
  return "tree/tree_seichou08.png";
}


function TravelCard({ group }: { group: Card }) {
  const percentage = group.progress;
  const treeImage = getTreeImage(percentage);

  return (
    <div className="rounded-2xl border border-gray-300 bg-white shadow-sm px-6 py-5 pt-5 pb-10">
      {/* タイトル */}
      <div className="text-lg font-semibold mb-4 text-black">{group.display_name}</div>

      {/* 進捗バー */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="text-base font-semibold text-black">{percentage}%</div>
      </div>

      <div className="h-px bg-gray-200 mb-6" />

      {/* 🌳 木の画像（ここが核心） */}
      <div className="w-full h-48 flex justify-center items-center mb-6">
        <Image
          src={`/${treeImage}`}    // public/tree/... に画像がある場合
          alt="tree-stage"
          width={200}
          height={200}
          className="h-full object-contain"
        />
      </div>

      {/* ボタン */}
      <div className="flex justify-center">
        <Link href="/points/purchase">
          <button className="px-6 py-2 rounded-full border border-white-200 text-xs text-white-500 bg-red-500">
            ポイント購入
          </button>
        </Link>
      </div>
    </div>
  );
}
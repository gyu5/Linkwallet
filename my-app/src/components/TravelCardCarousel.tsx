"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/pagination";
import Link from "next/link";

type TravelCard = {
  title: string;
  progress: number; // 0〜1
};

const cards: TravelCard[] = [
  { title: "9月旅行", progress: 0.1 },
  { title: "PC 買い替え", progress: 0.35 },
  { title: "引っ越し資金", progress: 0.55 },
];

export default function TravelCardCarousel() {
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
          {cards.map((card, idx) => (
            <SwiperSlide key={idx}>
              <TravelCard {...card} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

function getTreeImage(progress: number) {
  if (progress < 0.2) return "tree/1.jpg";
  if (progress < 0.4) return "tree/2.jpg";
  if (progress < 0.6) return "tree/3.jpg";
  if (progress < 0.8) return "tree/4.jpg";
  if (progress < 1.0) return "tree/5.jpg";
  return "tree/6.jpg";
}


function TravelCard({ title, progress }: TravelCard) {
  const percentage = Math.round(progress * 100);
  const treeImage = getTreeImage(progress);

  return (
    <div className="rounded-2xl border border-gray-300 bg-white shadow-sm px-6 py-5 pt-5 pb-10">
      {/* タイトル */}
      <div className="text-lg font-semibold mb-4 text-black">{title}</div>

      {/* 進捗バー */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500"
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
          <button className="px-6 py-2 rounded-full border border-purple-200 text-xs text-purple-500 bg-purple-50">
            ポイント購入
          </button>
        </Link>
      </div>
    </div>
  );
}
import TravelCardCarousel from "@/components/TravelCardCarousel";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#E6FAF4] flex flex-col items-center">
      {/* 上の通知アイコンとかヘッダーはここに置く */}
      <div className="mt-10 mb-4 w-full flex justify-end pr-10 text-gray-500">
        <span className="material-symbols-outlined text-4xl!">notifications</span>
      </div>

      <TravelCardCarousel />
    </div>
  );
}
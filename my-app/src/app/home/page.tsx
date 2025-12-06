import TravelCardCarousel from "@/components/TravelCardCarousel";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#E6FAF4] flex flex-col items-center">
      {/* 上の通知アイコンとかヘッダーはここに置く */}
      <div className="mt-10 mb-4 w-full flex justify-end pr-10 text-gray-500">
        <span className="material-symbols-outlined text-4xl!">notifications</span>
      </div>
      <div className="flex w-full px-4 mx-auto">
        <div className="justify-between items-center">
          <Image src="/logo.png" alt="LinkWallet" width={70} height={70} />
        </div>
      </div>

      <TravelCardCarousel />
    </div>
  );
}
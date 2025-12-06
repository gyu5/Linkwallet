import TravelCardCarousel from "@/components/TravelCardCarousel";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#E6FAF4] flex flex-col items-center">
      <div className="w-full px-4 mt-10 mb-4 flex justify-between items-center">
        <Image src="/logo.png" alt="LinkWallet" width={70} height={70} />
        <span className="flex justify-end material-symbols-outlined text-4xl! text-green-700">notifications</span>
      </div>

      <TravelCardCarousel />
    </div>
  );
}
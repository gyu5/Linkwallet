"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "ホーム", icon: "home" },
  { href: "/groups", label: "グループ", icon: "group" },
  { href: "/account", label: "アカウント", icon: "account_circle" },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 flex justify-around items-center z-50 pb-safe rounded-t-2xl">
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 flex-1 text-xs"
          >
            <span className={`material-symbols-outlined text-3xl ${active ? "text-green-500" : "text-gray-400"}`}>
              {item.icon}
            </span>
            <span className={active ? "text-green-500" : "text-gray-400"}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

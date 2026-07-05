"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Hash, Clock, Mail, LayoutGrid, Puzzle, MousePointerClick } from "lucide-react";

interface NavItem {
  name: string;
  nameEn: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: "도구 홈",
    nameEn: "Tools Home",
    href: "/tools",
    icon: <LayoutGrid className="w-4 h-4" />
  },
  {
    name: "1초 훅 제조기",
    nameEn: "1-Sec Hook",
    href: "/tools/hook-generator",
    icon: <Zap className="w-4 h-4" />
  },
  {
    name: "해시태그 스캐너",
    nameEn: "Hashtag Scanner",
    href: "/tools/hashtag-scanner",
    icon: <Hash className="w-4 h-4" />
  },
  {
    name: "템포 & 이탈률 계산기",
    nameEn: "Tempo Calculator",
    href: "/tools/tempo-calculator",
    icon: <Clock className="w-4 h-4" />
  },
  {
    name: "광고 제안서 생성기",
    nameEn: "Sponsor Pitch",
    href: "/tools/sponsor-pitch-generator",
    icon: <Mail className="w-4 h-4" />
  },
  {
    name: "대본 프레임워크",
    nameEn: "Script Framework",
    href: "/tools/script-framework",
    icon: <Puzzle className="w-4 h-4" />
  },
  {
    name: "CTA 멘트 마법사",
    nameEn: "CTA Wizard",
    href: "/tools/cta-wizard",
    icon: <MousePointerClick className="w-4 h-4" />
  }
];

export default function ToolSubNav() {
  const pathname = usePathname();

  return (
    <div className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-950/20 backdrop-blur-sm sticky top-[69px] z-30 -mt-8 mb-8">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-3 scrollbar-none -mb-px">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 border cursor-pointer ${
                  isActive
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-500 font-extrabold dark:bg-rose-500/20"
                    : "bg-transparent border-transparent text-zinc-650 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

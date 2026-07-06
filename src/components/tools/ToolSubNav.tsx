"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Hash, Clock, Mail, LayoutGrid, Puzzle, MousePointerClick, Clapperboard, MessageSquare } from "lucide-react";

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
  },
  {
    name: "타이틀 치트키",
    nameEn: "Title Cheat Key",
    href: "/tools/ctr-title",
    icon: <Clapperboard className="w-4 h-4" />
  },
  {
    name: "댓글 떡상 소재",
    nameEn: "Engagement Gen",
    href: "/tools/comment-engagement",
    icon: <MessageSquare className="w-4 h-4" />
  }
];

export default function ToolSubNav() {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return;
    // 수직 스크롤(deltaY)을 가로 스크롤로 변환
    if (e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-[64px] sm:top-[69px] z-30 mb-8">
      <div className="max-w-6xl mx-auto px-4 relative overflow-hidden">
        <nav 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
          className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-3 -mb-px whitespace-nowrap cursor-grab active:cursor-grabbing select-none scrollbar-hide [&::-webkit-scrollbar]:hidden"
          style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                draggable={false}
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
        {/* Right Fading Gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white via-white/80 dark:from-zinc-950 dark:via-zinc-950/80 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

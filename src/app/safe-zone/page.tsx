import React from "react";
import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SafeZonePreviewer from "@/components/home/SafeZonePreviewer";

export const metadata: Metadata = {
  title: "ShortsPack Pro - 숏폼 안전 영역(Safe Zone) 프리뷰어",
  description: "틱톡, 유튜브 쇼츠, 인스타그램 릴스, 도우인의 UI 가이드라인 오버레이를 통해 핵심 자막과 로고가 가려지지 않는지 즉시 검증하는 무료 크리에이터 프리뷰어 도구입니다.",
  alternates: {
    canonical: "https://shortspack.com/safe-zone"
  }
};

export default function SafeZonePage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-50 text-zinc-800 dark:bg-[#060609] dark:text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-white transition-colors duration-300">
      
      {/* Absolute Atmospheric Lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      
      <Header />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 md:py-12 z-10">
        <SafeZonePreviewer />
      </main>

      <Footer />
    </div>
  );
}

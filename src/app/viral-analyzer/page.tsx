import React from "react";
import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ViralAnalyzer from "@/components/home/ViralAnalyzer";

export const metadata: Metadata = {
  title: "ShortsPack Pro - AI 바이럴 영상 역설계 분석기",
  description: "인기 숏폼 비디오의 대본과 흐름을 입력하여 100만 조회수의 후킹 포인트, 이탈 방지 전개 방식, 행동 유도(CTA) 전략을 세밀히 역설계 분석하고 내 채널 맞춤형 아이디어를 얻어보세요.",
  alternates: {
    canonical: "https://shortspack.com/viral-analyzer"
  }
};

export default function ViralAnalyzerPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-50 text-zinc-800 dark:bg-[#060609] dark:text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-white transition-colors duration-300">
      
      {/* Absolute Atmospheric Lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      
      <Header />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 md:py-12 z-10">
        <ViralAnalyzer />
      </main>

      <Footer />
    </div>
  );
}

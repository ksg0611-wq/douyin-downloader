import React from "react";
import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AlgoHookGenerator from "@/components/home/AlgoHookGenerator";

export const metadata: Metadata = {
  title: "ShortsPack Pro - 알고리즘 폭발 CTA & 댓글 유도 멘트 생성기",
  description: "영상의 주제만 입력하면 시청 시간, 좋아요, 댓글, 저장 지표를 극대화하는 아웃트로 CTA 멘트와 고정 댓글용 질문 10종을 AI가 즉시 자동 생성해 드립니다.",
  alternates: {
    canonical: "https://shortspack.com/algo-hook-generator"
  }
};

export default function AlgoHookGeneratorPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-50 text-zinc-800 dark:bg-[#060609] dark:text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-white transition-colors duration-300">
      
      {/* Absolute Atmospheric Lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      
      <Header />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 md:py-12 z-10">
        <AlgoHookGenerator />
      </main>

      <Footer />
    </div>
  );
}

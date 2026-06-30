import React from "react";
import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ThumbnailTextGenerator from "@/components/tools/ThumbnailTextGenerator";

export const metadata: Metadata = {
  title: "ShortsPack Pro - 0.1초 시선 강탈 썸네일 텍스트 생성기",
  description: "영상의 주제만 입력하면 숏폼 피드에서 가장 눈길을 사로잡는 썸네일(커버) 카피라이팅 10종(매운맛/순한맛)을 AI가 즉시 자동 생성해 드립니다.",
  alternates: {
    canonical: "https://shortspack.com/thumbnail-text-generator"
  }
};

export default function ThumbnailTextGeneratorPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-50 text-zinc-800 dark:bg-[#060609] dark:text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-white transition-colors duration-300">
      
      {/* Absolute Atmospheric Lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      
      <Header />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 md:py-12 z-10">
        <ThumbnailTextGenerator />
      </main>

      <Footer />
    </div>
  );
}

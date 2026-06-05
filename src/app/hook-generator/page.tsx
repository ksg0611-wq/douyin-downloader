import React from "react";
import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HookGenerator from "@/components/home/HookGenerator";

export const metadata: Metadata = {
  title: "ShortsPack Pro - AI 기반 3초 후킹(Hook) 대본 생성기",
  description: "영상 주제 입력만으로 시청자의 시선을 3초 안에 사로잡을 수 있는 숏폼 대본의 첫 문장(Hook)을 3가지 바이럴 스타일(팩트폭행, 감성공감, 호기심유도)로 자동 생성해보세요.",
  alternates: {
    canonical: "https://shortspack.com/hook-generator"
  }
};

export default function HookGeneratorPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-50 text-zinc-800 dark:bg-[#060609] dark:text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-white transition-colors duration-300">
      
      {/* Absolute Atmospheric Lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      
      <Header />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 md:py-12 z-10">
        <HookGenerator />
      </main>

      <Footer />
    </div>
  );
}

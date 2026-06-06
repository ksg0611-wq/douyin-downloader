import React from "react";
import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SponsorPitchGenerator from "@/components/home/SponsorPitchGenerator";

export const metadata: Metadata = {
  title: "ShortsPack Pro - 브랜드 협찬(광고) 제안서 자동 생성기",
  description: "내 채널의 주요 시청자층과 주제를 기반으로 타겟 브랜드 마케터의 오픈율과 성사율을 극대화할 수 있는 비즈니스 협찬 콜드 메일 제안서를 AI로 자동 작성하세요.",
  alternates: {
    canonical: "https://shortspack.com/tools/sponsor-pitch-generator"
  }
};

export default function SponsorPitchGeneratorPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-50 text-zinc-800 dark:bg-[#060609] dark:text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-white transition-colors duration-300">
      
      {/* Absolute Atmospheric Lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      
      <Header />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 md:py-12 z-10">
        <SponsorPitchGenerator />
      </main>

      <Footer />
    </div>
  );
}

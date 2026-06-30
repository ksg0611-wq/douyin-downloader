import React from "react";
import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import UploadTimeCalculator from "@/components/tools/UploadTimeCalculator";

export const metadata: Metadata = {
  title: "ShortsPack Pro - 글로벌 크로스보더 최적 업로드 타임 계산기",
  description: "타겟 해외 국가와 플랫폼을 설정하면 현지 트래픽 집중 골든 아워 및 이에 최적화된 한국 기준(KST) 예약 업로드 시간대를 AI가 정확히 계산해 드립니다.",
  alternates: {
    canonical: "https://shortspack.com/upload-time-calculator"
  }
};

export default function UploadTimeCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-50 text-zinc-800 dark:bg-[#060609] dark:text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-white transition-colors duration-300">
      
      {/* Absolute Atmospheric Lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      
      <Header />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 md:py-12 z-10">
        <UploadTimeCalculator />
      </main>

      <Footer />
    </div>
  );
}

import React from "react";
import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BPMCalculator from "@/components/home/BPMCalculator";

export const metadata: Metadata = {
  title: "ShortsPack Pro - 숏폼 BGM 컷편집 계산기 (BPM Tapper)",
  description: "음악 비트에 맞춰 가볍게 화면을 터치하여 실시간 BPM을 측정하고, 비디오 편집 프로그램에 즉시 적용 가능한 1비트, 1/2비트, 1/4비트 컷타임(초 단위)을 간편하게 확인하세요.",
  alternates: {
    canonical: "https://shortspack.com/bpm-calculator"
  }
};

export default function BPMCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-50 text-zinc-800 dark:bg-[#060609] dark:text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-white transition-colors duration-300">
      
      {/* Absolute Atmospheric Lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      
      <Header />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 md:py-12 z-10">
        <BPMCalculator />
      </main>

      <Footer />
    </div>
  );
}

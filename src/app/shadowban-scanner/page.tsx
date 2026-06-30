import React from "react";
import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ShadowbanScanner from "@/components/tools/ShadowbanScanner";

export const metadata: Metadata = {
  title: "ShortsPack Pro - 틱톡/도우인 섀도우밴(Shadowban) 단어 스캐너",
  description: "영상 대본이나 캡션 텍스트를 실시간으로 스캔하여 틱톡, 도우인, 쇼츠 알고리즘 노출 제한(섀도우밴)을 유발할 수 있는 과장 광고 및 금지 키워드를 감지하고 우회하도록 제안하는 무료 도구입니다.",
  alternates: {
    canonical: "https://shortspack.com/shadowban-scanner"
  }
};

export default function ShadowbanScannerPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-50 text-zinc-800 dark:bg-[#060609] dark:text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-white transition-colors duration-300">
      
      {/* Absolute Atmospheric Lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      
      <Header />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 md:py-12 z-10">
        <ShadowbanScanner />
      </main>

      <Footer />
    </div>
  );
}

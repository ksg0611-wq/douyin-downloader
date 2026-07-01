import React from "react";
import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolSubNav from "@/components/tools/ToolSubNav";
import TempoCalculatorClient from "@/components/tools/TempoCalculatorClient";

export const metadata: Metadata = {
  title: "숏폼 템포 & 이탈률 방어 계산기 - ShortsPack Pro",
  description: "내 대본이 너무 긴가요? 1초당 읽기 속도를 분석하고, 영상의 이탈률을 방어하는 최적의 숏폼 템포를 지금 바로 계산해 보세요.",
  alternates: {
    canonical: "https://shortspack.com/tools/tempo-calculator"
  }
};

export default function TempoCalculatorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "숏폼 템포 & 이탈률 방어 계산기 - ShortsPack Pro",
    "description": "내 대본이 너무 긴가요? 1초당 읽기 속도를 분석하고, 영상의 이탈률을 방어하는 최적의 숏폼 템포를 지금 바로 계산해 보세요.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "url": "https://shortspack.com/tools/tempo-calculator",
    "author": {
      "@type": "Organization",
      "name": "ShortsPack Pro",
      "url": "https://shortspack.com"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-50 text-zinc-800 dark:bg-[#060609] dark:text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-white transition-colors duration-300">
        
        {/* Absolute Atmospheric Lighting */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
        
        <Header />

        <ToolSubNav />

        <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 md:py-12 z-10">
          <TempoCalculatorClient />
        </main>

        <Footer />
      </div>
    </>
  );
}

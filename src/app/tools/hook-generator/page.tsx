import React from "react";
import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolSubNav from "@/components/tools/ToolSubNav";
import HookGeneratorClient from "@/components/tools/HookGeneratorClient";

export const metadata: Metadata = {
  title: "터지는 1초 훅 제조기 - ShortsPack Pro",
  description: "숏폼 시청자의 시선을 1초 만에 사로잡는 강력한 오프닝 멘트를 지금 바로 생성해 보세요. 틱톡, 쇼츠, 릴스 알고리즘을 해킹하는 첫 문장 기획 도구입니다.",
  alternates: {
    canonical: "https://shortspack.com/tools/hook-generator"
  }
};

export default function HookGeneratorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "터지는 1초 훅 제조기 - ShortsPack Pro",
    "description": "숏폼 시청자의 시선을 1초 만에 사로잡는 강력한 오프닝 멘트를 지금 바로 생성해 보세요. 틱톡, 쇼츠, 릴스 알고리즘을 해킹하는 첫 문장 기획 도구입니다.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "url": "https://shortspack.com/tools/hook-generator",
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
          <HookGeneratorClient />
        </main>

        <Footer />
      </div>
    </>
  );
}

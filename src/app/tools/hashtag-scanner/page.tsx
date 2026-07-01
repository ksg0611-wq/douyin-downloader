import React from "react";
import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolSubNav from "@/components/tools/ToolSubNav";
import HashtagScannerClient from "@/components/tools/HashtagScannerClient";

export const metadata: Metadata = {
  title: "알고리즘 해시태그 스캐너 - ShortsPack Pro",
  description: "내 숏폼 영상의 도달률을 200% 높여주는 황금 키워드와 인기 해시태그 조합을 찾아보세요.",
  alternates: {
    canonical: "https://shortspack.com/tools/hashtag-scanner"
  }
};

export default function HashtagScannerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "알고리즘 해시태그 스캐너 - ShortsPack Pro",
    "description": "내 숏폼 영상의 도달률을 200% 높여주는 황금 키워드와 인기 해시태그 조합을 찾아보세요.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "url": "https://shortspack.com/tools/hashtag-scanner",
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
          <HashtagScannerClient />
        </main>

        <Footer />
      </div>
    </>
  );
}

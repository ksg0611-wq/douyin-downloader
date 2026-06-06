import React from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

interface HeroSectionProps {
  lang?: "ko" | "en";
}

export default function HeroSection({ lang = "ko" }: HeroSectionProps) {
  return (
    <div id="hero-section" className="text-center max-w-3xl mx-auto mt-6 mb-8 md:mt-10 md:mb-12">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-1.5 bg-blue-50/80 dark:bg-zinc-900/60 border border-blue-200 dark:border-zinc-800 px-3.5 py-1.5 rounded-full text-xs text-blue-900 dark:text-zinc-400 mb-4 font-semibold shadow-sm dark:shadow-none"
      >
        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
        <span>
          {lang === "ko" 
            ? "최신 Douyin · Xiaohongshu V2 전용 아웃트로 컷팅 알고리즘 업데이트 완료"
            : "Latest Douyin & Xiaohongshu V2 Outro Cutting Algorithm Updated"}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
      </motion.div>

      {lang === "ko" ? (
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-black tracking-tight leading-tight text-zinc-950 dark:text-white break-keep"
        >
          도우인·샤오홍슈 <br className="sm:hidden" />
          <span className="bg-gradient-to-r from-blue-600 via-purple-650 to-rose-600 dark:from-[#00f2fe] dark:via-purple-400 dark:to-[#fe0979] bg-clip-text text-transparent">
            클린 비디오 분석·저장
          </span>
        </motion.h2>
      ) : (
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-black tracking-tight leading-tight text-zinc-950 dark:text-white break-keep"
        >
          Douyin & Xiaohongshu <br className="sm:hidden" />
          <span className="bg-gradient-to-r from-blue-600 via-purple-650 to-rose-600 dark:from-[#00f2fe] dark:via-purple-400 dark:to-[#fe0979] bg-clip-text text-transparent">
            Clean Video Analysis & Saving
          </span>
        </motion.h2>
      )}

      <p className="text-zinc-800 dark:text-zinc-400 text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed font-semibold">
        {lang === "ko" 
          ? "동영상 주소 입력 한 번으로 도우인 및 샤오홍슈의 원본 고화질 비디오 소스를 즉시 분석하고 추출합니다."
          : "Instantly analyze and extract original HD video sources from Douyin and Xiaohongshu with a single click."}
      </p>

      {/* 종합 크리에이터 툴박스 배지 라인업 */}
      <div className="mt-5 flex flex-wrap justify-center gap-1.5 max-w-2xl mx-auto px-4">
        <span className="text-[10.5px] sm:text-xs text-zinc-850 dark:text-zinc-400 font-extrabold self-center mr-1">
          {lang === "ko" ? "💡 크리에이터 필수 도구 탑재:" : "💡 Integrated Creator Tools:"}
        </span>
        {[
          { ko: "📝 AI 대본 추출·요약", en: "📝 AI Script Extractor" },
          { ko: "📊 해시태그 트렌드 분석", en: "📊 Hashtag Trend" },
          { ko: "🌐 다국어 제목 번역", en: "🌐 Global Translator" },
          { ko: "🎨 썸네일 자막 합성", en: "🎨 Thumbnail Editor" },
          { ko: "🧮 예상 수익 계산기", en: "🧮 Revenue Simulator" },
        ].map((item, index) => (
          <span
            key={index}
            className="px-2.5 py-0.5 rounded-full bg-zinc-150/80 dark:bg-zinc-900/60 border border-zinc-250 dark:border-zinc-800 text-[10px] sm:text-[11px] text-zinc-850 dark:text-zinc-400 font-bold hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-950 dark:hover:text-zinc-300 transition-colors"
          >
            {lang === "ko" ? item.ko : item.en}
          </span>
        ))}
      </div>
    </div>
  );
}

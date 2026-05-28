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
        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-950/40 via-purple-950/20 to-rose-950/40 border border-zinc-800 px-3 py-1.5 rounded-full text-xs text-zinc-400 mb-4"
      >
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
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
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight"
        >
          도우인 · 샤오홍수 비디오 <br className="sm:hidden" />
          <span className="bg-gradient-to-r from-[#00f2fe] via-purple-400 to-[#fe0979] bg-clip-text text-transparent">
            워터마크 없는 초고화질
          </span> 다운로드
        </motion.h2>
      ) : (
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight"
        >
          Douyin & Xiaohongshu <br className="sm:hidden" />
          <span className="bg-gradient-to-r from-[#00f2fe] via-purple-400 to-[#fe0979] bg-clip-text text-transparent">
            Watermark-Free HD
          </span> Downloader
        </motion.h2>
      )}

      <p className="text-zinc-400 text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
        {lang === "ko" 
          ? "동영상 링크 주소 한 번의 클릭만으로 도우인(Douyin)과 샤오홍수(Xiaohongshu) 동영상의 브랜드 로고와 워터마크가 완전히 배제된 깔끔한 원본 고화질 버전을 즉시 다운로드 해 드립니다."
          : "With just one click of the video link, instantly download clean, original high-definition videos with brand logos and watermarks completely removed from Douyin and Xiaohongshu."}
      </p>
    </div>
  );
}

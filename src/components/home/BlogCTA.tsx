"use client";

import React from "react";
import Link from "next/link";
import { Download, Sparkles, TrendingUp, ShieldAlert, Languages } from "lucide-react";

interface BlogCTAProps {
  category?: string;
}

export default function BlogCTA({ category = "" }: BlogCTAProps) {
  // Determine CTA text, description, icon, and link based on the category
  let title = "크리에이터 레퍼런스용 원본 화질 저장 도구";
  let desc = "도우인, 샤오홍슈의 인기 영상을 무손실 클린 원본 그대로 분석 및 저장하여 벤치마킹을 시작해 보세요.";
  let btnText = "🚀 지금 바로 클린 버전 추출하기";
  let link = "/?scroll=downloader";
  let icon = <Download className="w-5 h-5 text-white animate-bounce" />;
  let gradient = "from-[#00f2fe] via-[#5c64ff] to-[#fe0979]";

  if (category.includes("마케팅") || category.includes("해시태그") || category.includes("트렌드")) {
    title = "실시간 해시태그 트렌드 분석기";
    desc = "중국 및 글로벌 숏폼 해시태그의 유입량, 경쟁도, 연관 바이럴 태그를 AI로 정밀 분석하여 노출 확률을 높이세요.";
    btnText = "🔥 해시태그 트렌드 분석기 써보기";
    link = "/?tool=hashtag";
    icon = <TrendingUp className="w-5 h-5 text-white" />;
    gradient = "from-cyan-500 to-blue-600";
  } else if (category.includes("AI") || category.includes("대본") || category.includes("후킹")) {
    title = "AI 3초 후킹 대본 생성기";
    desc = "시청자의 시선을 3초 만에 사로잡을 수 있는 3가지 바이럴 스타일(팩트폭행, 감성공감, 호기심유도)의 후킹 도입부 대본을 자동 생성하세요.";
    btnText = "🪄 AI 3초 후킹 대본 생성기 실행하기";
    link = "/?tool=hook-generator";
    icon = <Sparkles className="w-5 h-5 text-white" />;
    gradient = "from-indigo-600 via-purple-600 to-rose-500";
  } else if (category.includes("번역") || category.includes("글로벌")) {
    title = "다국어 숏폼 제목 번역 & AI 바이럴 피드백";
    desc = "영어, 일본어, 베트남어 등 글로벌 인기 숏폼 문법에 최적화된 번역과 해외 오디언스 저격 팁을 얻어보세요.";
    btnText = "🌐 다국어 번역 및 피드백 기능 실행하기";
    link = "/?tool=translator";
    icon = <Languages className="w-5 h-5 text-white" />;
    gradient = "from-teal-500 to-emerald-600";
  } else if (category.includes("규제") || category.includes("섀도우밴") || category.includes("스캐너")) {
    title = "섀도우밴 위험 단어 스캐너";
    desc = "내 숏폼 영상의 설명란이나 자막 텍스트 중 알고리즘 차단(Shadowban)을 유발할 수 있는 위험 단어가 있는지 실시간 확인해 보세요.";
    btnText = "🛡️ 섀도우밴 스캐너 바로가기";
    link = "/?tool=shadowban-scanner";
    icon = <ShieldAlert className="w-5 h-5 text-white" />;
    gradient = "from-rose-500 to-red-600";
  }

  return (
    <div className="my-12 p-6 sm:p-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-3xl shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
            ⚡ ShortsPack Pro Creator Toolbox
          </div>
          <h4 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            {title}
          </h4>
          <p className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 leading-relaxed max-w-xl">
            {desc}
          </p>
        </div>

        <Link
          href={link}
          className={`shrink-0 w-full md:w-auto py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${gradient} hover:brightness-105 active:scale-95 shadow-lg shadow-zinc-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300`}
        >
          {icon}
          <span>{btnText}</span>
        </Link>
      </div>
    </div>
  );
}

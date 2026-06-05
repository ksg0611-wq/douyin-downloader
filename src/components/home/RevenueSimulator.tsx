"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calculator,
  TrendingUp,
  Coins,
  Sparkles,
  Sliders,
  DollarSign,
} from "lucide-react";

// 카테고리 정의 및 가중치
const CATEGORIES = [
  { key: "beauty", label: "뷰티·패션 💄", multiplier: 1.3 },
  { key: "tech", label: "테크·IT 💻", multiplier: 1.5 },
  { key: "mukbang", label: "먹방·요리 🍳", multiplier: 1.1 },
  { key: "vlog", label: "일상·브이로그 ☕", multiplier: 1.0 },
  { key: "finance", label: "비즈니스·재테크 📈", multiplier: 1.5 },
] as const;

// 플랫폼 정의 및 속성
const PLATFORMS = [
  {
    key: "shorts",
    label: "유튜브 쇼츠",
    renderIcon: (className?: string) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
      </svg>
    ),
    rpmMin: 0.1,
    rpmMax: 0.3,
    sponsorIndex: 1.5,
    themeColor: "from-rose-500 to-red-600",
    glowColor: "shadow-rose-500/10 border-rose-300/60 text-rose-650 dark:shadow-rose-500/20 dark:border-rose-500/50 dark:text-rose-200",
    accentColor: "accent-rose-500",
  },
  {
    key: "reels",
    label: "인스타그램 릴스",
    renderIcon: (className?: string) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
    rpmMin: 0.02,
    rpmMax: 0.08,
    sponsorIndex: 1.2,
    themeColor: "from-fuchsia-500 to-pink-600",
    glowColor: "shadow-fuchsia-500/10 border-fuchsia-300/60 text-fuchsia-650 dark:shadow-fuchsia-500/20 dark:border-fuchsia-500/50 dark:text-fuchsia-200",
    accentColor: "accent-fuchsia-500",
  },
  {
    key: "tiktok",
    label: "틱톡",
    renderIcon: (className?: string) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
    rpmMin: 0.05,
    rpmMax: 0.15,
    sponsorIndex: 1.0,
    themeColor: "from-cyan-500 to-blue-500",
    glowColor: "shadow-cyan-500/10 border-cyan-300/60 text-cyan-650 dark:shadow-cyan-500/20 dark:border-cyan-500/50 dark:text-cyan-200",
    accentColor: "accent-cyan-500",
  },
] as const;

// 조회수 퀵 프리셋
const QUICK_VIEWS = [
  { label: "10만", value: 100000 },
  { label: "50만", value: 500000 },
  { label: "100만", value: 1000000 },
  { label: "500만", value: 5000000 },
  { label: "1,000만", value: 10000000 },
];

export default function RevenueSimulator() {
  const [activePlatform, setActivePlatform] = useState<(typeof PLATFORMS)[number]["key"]>("shorts");
  const [activeCategory, setActiveCategory] = useState<string>("tech");
  const [views, setViews] = useState<number>(500000); // 디폴트 50만 뷰

  // 현재 활성화된 플랫폼 설정 정보 추출
  const platformConfig = useMemo(() => {
    return PLATFORMS.find((p) => p.key === activePlatform) || PLATFORMS[0];
  }, [activePlatform]);

  // 현재 활성화된 카테고리 가중치 추출
  const categoryWeight = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.key === activeCategory);
    return cat ? cat.multiplier : 1.0;
  }, [activeCategory]);

  // 실시간 예상 수익 연산
  const calculations = useMemo(() => {
    const rpmMin = platformConfig.rpmMin;
    const rpmMax = platformConfig.rpmMax;
    const sponsorIndex = platformConfig.sponsorIndex;

    // 1. 조회수 순수익 범위 계산
    const netRevenueMin = views * rpmMin * categoryWeight;
    const netRevenueMax = views * rpmMax * categoryWeight;

    // 2. 브랜드 협찬 PPL 단가 계산 (난수처럼 보이지만 안정적인 일정한 정밀 수식)
    const sponsorMin = views * categoryWeight * sponsorIndex * 15;
    const sponsorMax = views * categoryWeight * sponsorIndex * 35;

    return {
      netRevenueMin,
      netRevenueMax,
      sponsorMin,
      sponsorMax,
    };
  }, [views, platformConfig, categoryWeight]);

  // 조회수 포맷터 (예: 1250000 -> "125만")
  const formatViewsKorean = (val: number) => {
    if (val >= 10000000) return "1,000만";
    if (val >= 10000) {
      const man = Math.floor(val / 10000);
      const rest = val % 10000;
      if (rest === 0) return `${man}만`;
      return `${man}만 ${rest.toLocaleString()}`;
    }
    return val.toLocaleString();
  };

  // 통화 포맷터 (예: 125000 -> "125,000")
  const formatCurrency = (val: number) => {
    return Math.floor(val).toLocaleString() + " 원";
  };

  // 한글 통화 포맷터 (예: 1500000 -> "약 150만 원")
  const formatCurrencyKorean = (val: number) => {
    if (val >= 100000000) {
      const eok = (val / 100000000).toFixed(1);
      return `약 ${eok}억 원`;
    }
    if (val >= 10000) {
      const man = Math.floor(val / 10000);
      return `약 ${man}만 원`;
    }
    return `약 ${Math.floor(val).toLocaleString()}원`;
  };

  return (
    <section id="revenue-simulator" className="max-w-4xl mx-auto mt-12">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
            🧮 숏폼 예상 수익 & 광고 단가 시뮬레이터
          </h2>
          <p className="text-xs text-zinc-550 dark:text-zinc-500">
            조회수와 카테고리를 설정하여 순수익 및 브랜드 광고 협찬료를 즉시 시뮬레이션해 보세요
          </p>
        </div>
      </div>

      {/* 메인 박스 */}
      <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-xl dark:shadow-2xl relative overflow-hidden">
        {/* 배경 글로우 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* 인터랙티브 입력 영역 */}
        <div className="space-y-6 relative z-10">
          {/* 플랫폼 및 카테고리 2열 배치 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 플랫폼 선택 */}
            <div className="space-y-2">
              <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">
                💻 플랫폼 선택
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PLATFORMS.map((platform) => {
                  const isActive = activePlatform === platform.key;
                  return (
                    <button
                      key={platform.key}
                      onClick={() => setActivePlatform(platform.key)}
                      className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-[11.5px] font-bold border transition-all cursor-pointer ${
                        isActive
                          ? `bg-white border-zinc-300 text-zinc-850 shadow-md ${platform.glowColor} dark:bg-gradient-to-b dark:from-zinc-900 dark:to-zinc-900/40 dark:border-zinc-700/80`
                          : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-850 dark:bg-zinc-900/40 dark:border-zinc-800/80 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-200"
                      }`}
                    >
                      {platform.renderIcon(
                        `w-4 h-4 transition-transform ${
                          isActive ? "scale-110" : "opacity-60"
                        }`
                      )}
                      <span>{platform.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 카테고리 선택 */}
            <div className="space-y-2">
              <label className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider block">
                🏷️ 채널 카테고리
              </label>
              <div className="relative">
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 text-xs sm:text-sm text-zinc-800 placeholder-zinc-400 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 resize-none font-sans leading-relaxed transition-colors appearance-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key} className="bg-white text-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
                      {cat.label} (가중치 x{cat.multiplier.toFixed(1)})
                    </option>
                  ))}
                </select>
                {/* 커스텀 화살표 */}
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-400">
                  <Sliders className="w-3.5 h-3.5 opacity-60" />
                </div>
              </div>
            </div>
          </div>

          {/* 슬라이더 컨트롤 */}
          <div className="space-y-3 bg-zinc-50/50 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-900 rounded-xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                📈 예상 조회수
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-zinc-900 dark:text-white font-mono">
                  {views.toLocaleString()}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-bold">
                  회 ({formatViewsKorean(views)} 뷰)
                </span>
              </div>
            </div>

            {/* 슬라이더 인풋 */}
            <div className="py-2.5">
              <input
                type="range"
                min={10000}
                max={10000000}
                step={10000}
                value={views}
                onChange={(e) => setViews(Number(e.target.value))}
                className={`w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer focus:outline-none ${platformConfig.accentColor}`}
              />
              <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-600 font-mono mt-1.5">
                <span>1만 회</span>
                <span>500만 회</span>
                <span>1,000만 회</span>
              </div>
            </div>

            {/* 퀵 뷰 선택 단추 */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[9px] text-zinc-550 dark:text-zinc-500 font-bold uppercase tracking-wider self-center mr-1">
                빠른 설정:
              </span>
              {QUICK_VIEWS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setViews(preset.value)}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                    views === preset.value
                      ? "bg-zinc-200 border-zinc-300 text-emerald-650 shadow-sm dark:bg-zinc-805 dark:border-zinc-700 dark:text-emerald-400"
                      : "bg-white border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:border-zinc-300 dark:bg-zinc-900/50 dark:border-zinc-800/60 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 결과 대시보드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* 예상 조회수 순수익 */}
            <div className="bg-zinc-50/50 border border-zinc-200 hover:border-emerald-500/30 dark:bg-zinc-900/30 dark:border-zinc-850 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Coins className="w-16 h-16 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-bold mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                💵 예상 조회수 순수익 (RPM)
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activePlatform}-${activeCategory}-${views}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-1"
                >
                  <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-300 font-mono filter drop-shadow-[0_0_12px_rgba(52,211,153,0.15)]">
                    {formatCurrency(calculations.netRevenueMin)}
                    <span className="text-sm font-semibold text-zinc-405 dark:text-zinc-500 mx-1.5 font-sans">~</span>
                    {formatCurrency(calculations.netRevenueMax)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400/80 font-semibold font-sans">
                    {formatCurrencyKorean(calculations.netRevenueMin)} ~ {formatCurrencyKorean(calculations.netRevenueMax)}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="text-[10px] text-zinc-550 dark:text-zinc-500 mt-3.5 leading-normal">
                조회수당 정산 비율({platformConfig.rpmMin}원 ~ {platformConfig.rpmMax}원) 및 채널 카테고리 가중치를 곱해 산출된 기본 플랫폼 정산 액수입니다.
              </div>
            </div>

            {/* 추천 브랜드 협찬 단가 */}
            <div className="bg-zinc-50/50 border border-zinc-200 hover:border-cyan-500/30 dark:bg-zinc-900/30 dark:border-zinc-850 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-cyan-500/20 transition-all">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Sparkles className="w-16 h-16 text-cyan-400" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-bold mb-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                🤝 추천 브랜드 협찬 단가 (PPL)
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activePlatform}-${activeCategory}-${views}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-1"
                >
                  <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-300 font-mono filter drop-shadow-[0_0_12px_rgba(34,211,238,0.15)]">
                    {formatCurrency(calculations.sponsorMin)}
                    <span className="text-sm font-semibold text-zinc-405 dark:text-zinc-500 mx-1.5 font-sans">~</span>
                    {formatCurrency(calculations.sponsorMax)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-cyan-600 dark:text-cyan-400/80 font-semibold font-sans">
                    {formatCurrencyKorean(calculations.sponsorMin)} ~ {formatCurrencyKorean(calculations.sponsorMax)}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="text-[10px] text-zinc-550 dark:text-zinc-500 mt-3.5 leading-normal">
                플랫폼 신뢰도 지수({platformConfig.sponsorIndex}x) 및 마케팅 시장 가치를 반영해, 브랜드 광고주 협상 시 제안 가능한 합리적인 1회 계약 몸값 범위입니다.
              </div>
            </div>
          </div>

          {/* 마케팅 가이드 하단 문구 */}
          <div className="flex items-start gap-2 bg-zinc-50/50 border border-zinc-200 text-zinc-600 dark:bg-zinc-900/40 dark:border-zinc-900 dark:text-zinc-400 p-3 rounded-xl text-xs mt-4 leading-relaxed">
            <span className="text-emerald-600 dark:text-emerald-400 shrink-0 font-bold">💡 팁:</span>
            <span>
              <strong>테크·IT</strong> 및 <strong>비즈니스·재테크</strong> 카테고리는 타 카테고리 대비 구매 전환율이 높아 광고 단가가 높게 책정됩니다. 실제 제작 단가는 제작 난이도 및 크리에이터의 팔로워 인지도에 따라 상이할 수 있습니다.
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}

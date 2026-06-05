"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  Hash,
  Search,
  Copy,
  CheckCircle2,
  RefreshCcw,
  BarChart2,
  Zap,
  AlertCircle,
} from "lucide-react";

interface ChartPoint {
  date: string;
  views: number;
  posts: number;
}

interface TrendResult {
  keyword: string;
  trendScore: number;
  totalPosts: number;
  competition: "상" | "중" | "하";
  competitionEn: string;
  competitionColor: string;
  chartData: ChartPoint[];
  relatedHashtags: string[];
  insights: string[];
}

// ── 커스텀 툴팁 ──
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 border border-zinc-200 text-zinc-800 dark:bg-zinc-900/95 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs shadow-2xl backdrop-blur-xl">
        <p className="text-zinc-500 dark:text-zinc-400 mb-1 font-bold">{label}</p>
        <p className="text-cyan-600 dark:text-cyan-300 font-mono font-bold">
          📊 조회수: {Number(payload[0]?.value).toLocaleString()}
        </p>
        {payload[1] && (
          <p className="text-purple-650 dark:text-purple-300 font-mono">
            📝 게시물: {Number(payload[1]?.value).toLocaleString()}
          </p>
        )}
      </div>
    );
  }
  return null;
};

// ── 경쟁도 배지 색상 ──
function getCompetitionStyle(competition: string) {
  if (competition === "상") return "bg-rose-50/80 text-rose-600 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30";
  if (competition === "중") return "bg-amber-50/80 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30";
  return "bg-emerald-50/80 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30";
}

// ── 트렌드 점수 색상 ──
function getTrendColor(score: number) {
  if (score >= 70) return "text-cyan-600 dark:text-cyan-400";
  if (score >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-zinc-500 dark:text-zinc-400";
}

export default function HashtagTrendAnalyzer() {
  const [keyword, setKeyword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<TrendResult | null>(null);
  const [error, setError] = React.useState("");
  const [copiedTag, setCopiedTag] = React.useState<string | null>(null);
  const [copiedAll, setCopiedAll] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    setIsDark(document.documentElement.classList.contains("dark"));
    return () => observer.disconnect();
  }, []);

  const QUICK_KEYWORDS = ["먹방", "뷰티", "다이어트", "강아지", "여행", "패션", "운동", "카페"];

  const handleAnalyze = async (kw?: string) => {
    const target = (kw || keyword).trim();
    if (!target) {
      setError("해시태그 키워드를 입력해 주세요.");
      return;
    }
    setIsLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/hashtag-trend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "분석 실패");
      setResult(data);
      if (kw) setKeyword(kw);
    } catch (e: any) {
      setError(e.message || "분석 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTag = async (tag: string) => {
    await navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const handleCopyAll = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.relatedHashtags.join(" "));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const formatViews = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return String(v);
  };

  return (
    <section id="hashtag-trend-analyzer" className="max-w-4xl mx-auto">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
            📊 실시간 해시태그 트렌드 분석기
          </h2>
          <p className="text-xs text-zinc-550 dark:text-zinc-500">
            인스타그램 · 틱톡 · 도우인 키워드별 7일 트렌드 & 마케팅 인사이트
          </p>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-xl dark:shadow-2xl relative overflow-hidden">
        {/* 배경 글로우 */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* 입력 영역 */}
        <div className="relative flex flex-col sm:flex-row gap-2.5 mb-4">
          <div className="relative flex-grow group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl opacity-0 group-focus-within:opacity-60 transition duration-300 blur-sm pointer-events-none" />
            <div className="relative flex items-center bg-zinc-50 border border-zinc-250 dark:bg-zinc-900 dark:border-zinc-800 rounded-xl">
              <Hash className="w-4 h-4 text-zinc-405 ml-3.5 shrink-0" />
              <input
                id="hashtag-keyword-input"
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                placeholder="분석할 해시태그 키워드 입력 (예: 먹방, 뷰티, 다이어트)"
                className="w-full bg-transparent text-zinc-800 placeholder-zinc-400 dark:text-zinc-100 dark:placeholder-zinc-500 text-sm px-3 py-3.5 focus:outline-none font-sans"
              />
            </div>
          </div>
          <button
            id="hashtag-analyze-btn"
            onClick={() => handleAnalyze()}
            disabled={isLoading}
            className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-cyan-600 hover:brightness-110 active:scale-[0.98] text-white font-extrabold text-sm px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shrink-0 shadow-lg shadow-violet-950/30"
          >
            {isLoading ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{isLoading ? "분석 중..." : "트렌드 분석"}</span>
          </button>
        </div>

        {/* 빠른 키워드 태그 */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {QUICK_KEYWORDS.map((kw) => (
            <button
              key={kw}
              onClick={() => handleAnalyze(kw)}
              className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-650 hover:text-zinc-900 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 dark:border-zinc-700/60 dark:text-zinc-400 dark:hover:text-zinc-100 text-[11px] font-bold transition-all cursor-pointer"
            >
              #{kw}
            </button>
          ))}
        </div>

        {/* 에러 메시지 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-rose-500 dark:text-rose-400 text-xs font-medium mb-4 px-1"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 로딩 스켈레톤 */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="h-5 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg animate-pulse w-1/3" />
              <div className="h-48 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl animate-pulse" />
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl animate-pulse" />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 결과 영역 */}
        <AnimatePresence>
          {result && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 80 }}
              className="space-y-5"
            >
              {/* 키워드 헤더 & 트렌드 점수 */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800/60 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-zinc-900 dark:text-white">#{result.keyword}</span>
                  <span className="text-xs text-zinc-500">7일 트렌드 분석 결과</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                  <span className="text-xs text-zinc-605 dark:text-zinc-400 font-medium">트렌드 지수</span>
                  <span className={`text-2xl font-black font-mono ${getTrendColor(result.trendScore)}`}>
                    {result.trendScore}
                  </span>
                  <span className="text-xs text-zinc-500">/100</span>
                </div>
              </div>

              {/* 📈 라인 차트 */}
              <div>
                <p className="text-[11px] font-bold text-zinc-550 dark:text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                  7일간 조회수 트렌드
                </p>
                <div className="w-full h-48 sm:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00f2fe" stopOpacity={0.01} />
                        </linearGradient>
                        <linearGradient id="lineGradientStroke" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#7c3aed" />
                          <stop offset="50%" stopColor="#00f2fe" />
                          <stop offset="100%" stopColor="#fe0979" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e4e4e7"} vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: isDark ? "#71717a" : "#a1a1aa", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={formatViews}
                        tick={{ fill: isDark ? "#71717a" : "#a1a1aa", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke="url(#lineGradientStroke)"
                        strokeWidth={2.5}
                        fill="url(#trendGradient)"
                        dot={false}
                        activeDot={{ r: 5, fill: "#00f2fe", stroke: isDark ? "#0e0e12" : "#ffffff", strokeWidth: 2 }}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 스탯 배지 3종 */}
              <div className="grid grid-cols-3 gap-2.5">
                {/* 총 게시물 */}
                <div className="bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">총 게시물</span>
                  <span className="text-base sm:text-lg font-black text-zinc-900 dark:text-white font-mono">
                    {result.totalPosts >= 1000000
                      ? `${(result.totalPosts / 1000000).toFixed(1)}M`
                      : `${(result.totalPosts / 1000).toFixed(0)}K`}
                  </span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-650 block">누적</span>
                </div>
                {/* 경쟁 강도 */}
                <div className="bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">경쟁 강도</span>
                  <span className={`text-base sm:text-lg font-black font-mono px-2 py-0.5 rounded-lg border ${getCompetitionStyle(result.competition)}`}>
                    {result.competition}
                  </span>
                </div>
                {/* 트렌드 방향 */}
                <div className="bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/60 dark:border-zinc-800 rounded-xl p-3 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">트렌드</span>
                  <span className={`text-base sm:text-lg font-black font-mono ${getTrendColor(result.trendScore)}`}>
                    {result.trendScore >= 70 ? "🔥 상승" : result.trendScore >= 40 ? "📊 보통" : "📉 하락"}
                  </span>
                </div>
              </div>

              {/* 마케팅 인사이트 */}
              <div className="space-y-2">
                {result.insights.map((insight, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 bg-violet-50 border border-violet-100 dark:bg-violet-950/20 dark:border-violet-500/15 rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 dark:text-violet-250 leading-relaxed"
                  >
                    <span className="shrink-0 mt-0.5">💡</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>

              {/* 연관 해시태그 태그 클라우드 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold text-zinc-550 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    함께 쓰기 좋은 연관 해시태그
                  </p>
                  <button
                    onClick={handleCopyAll}
                    className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-white transition-all cursor-pointer"
                  >
                    {copiedAll ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                        <span className="text-emerald-550 dark:text-emerald-400">전체 복사됨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>전체 복사</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.relatedHashtags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleCopyTag(tag)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                        copiedTag === tag
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                          : "bg-white border-zinc-200 text-zinc-700 hover:bg-violet-50 hover:border-violet-250 hover:text-violet-800 dark:bg-zinc-800/80 dark:border-zinc-700/60 dark:text-zinc-300 dark:hover:bg-violet-600/20 dark:hover:border-violet-500/40 dark:hover:text-violet-200"
                      }`}
                    >
                      {copiedTag === tag ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-60" />
                      )}
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 재분석 버튼 */}
              <button
                onClick={() => handleAnalyze()}
                className="w-full mt-1 py-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-350 text-zinc-600 hover:text-zinc-850 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:hover:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>재분석</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 빈 상태 안내 */}
        {!result && !isLoading && !error && (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-600">
            <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">키워드를 입력하거나 빠른 태그를 클릭하면</p>
            <p className="text-xs mt-1">7일간 트렌드 차트가 그려집니다</p>
          </div>
        )}
      </div>
    </section>
  );
}

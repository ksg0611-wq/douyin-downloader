"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  RefreshCcw, 
  AlertCircle, 
  ChevronRight,
  Flame,
  Lightbulb,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HookGeneratorProps {
  lang?: "ko" | "en";
}

interface HookData {
  fact: string;
  empathy: string;
  question: string;
}

const QUICK_TOPICS = [
  "다이어트 식단",
  "직장인 재테크",
  "인스타 떡상법",
  "유튜브 알고리즘",
  "퇴사 고민",
  "반려견 훈련",
  "초간단 요리",
  "스마트폰 꿀팁"
];

export default function HookGenerator({ lang = "ko" }: HookGeneratorProps) {
  const [topic, setTopic] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<HookData | null>(null);
  const [error, setError] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async (targetTopic?: string) => {
    const activeTopic = (targetTopic ?? topic).trim();
    if (!activeTopic) {
      setError(lang === "ko" ? "영상 주제를 입력해 주세요." : "Please enter a video topic.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/generate-hook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: activeTopic })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "AI 생성 중 오류가 발생했습니다.");
      }

      setResult(data.data);
      if (targetTopic) {
        setTopic(targetTopic);
      }
    } catch (err: any) {
      setError(err.message || "서버 통신 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (e) {
      // safe bypass
    }
  };

  const handleQuickClick = (item: string) => {
    setTopic(item);
    handleGenerate(item);
  };

  return (
    <div id="hook-generator-container" className="w-full max-w-4xl mx-auto">
      {/* 타이틀 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            🪄 AI 3초 후킹(Hook) 대본 생성기
            <span className="bg-gradient-to-r from-cyan-400 to-rose-500 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              AI
            </span>
          </h2>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-0.5">
            제작하려는 영상의 주제만 입력하면, 시청자의 시선을 3초 안에 사로잡을 3대 마케팅 스타일의 도입부 대본을 자동 생성합니다.
          </p>
        </div>
      </div>

      {/* 입력 패널 */}
      <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-5 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <label htmlFor="topic-input" className="block text-xs font-bold text-zinc-850 dark:text-zinc-300 uppercase tracking-wider px-1">
            🎯 영상의 핵심 주제 입력
          </label>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-xl opacity-10 group-focus-within:opacity-40 transition duration-300 blur-sm pointer-events-none" />
              <input
                id="topic-input"
                type="text"
                className="relative w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-400/60 transition-colors font-sans"
                placeholder={lang === "ko" ? "예: 바쁜 현대인을 위한 간단한 아침 운동, 소액 부동산 투자법" : "e.g., Easy morning workout for busy people"}
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerate();
                }}
              />
            </div>

            <button
              onClick={() => handleGenerate()}
              disabled={isLoading}
              className={`py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-lg ${
                isLoading
                  ? "bg-zinc-800 text-zinc-500 border border-zinc-700 pointer-events-none"
                  : "bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 hover:brightness-105 active:scale-95 shadow-indigo-500/10"
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin text-zinc-500" />
                  <span>생성 중...</span>
                </>
              ) : (
                <>
                  <span>대본 생성하기</span>
                  <span>🪄</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 퀵 프리셋 키워드 */}
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block px-1">
            ⚡ 추천 인기 주제 퀵 테스트
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_TOPICS.map((item) => (
              <button
                key={item}
                onClick={() => handleQuickClick(item)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 bg-zinc-50/50 hover:bg-zinc-100 hover:border-zinc-300 dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 cursor-pointer transition-all active:scale-95"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 에러 상태 안내 배너 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-950/30 dark:bg-red-950/20 dark:text-red-400 text-xs font-bold flex items-center gap-2 mb-6"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 결과 구역 */}
      <div className="space-y-4">
        {/* 로딩용 카드 스켈레톤 */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-900 rounded-2xl p-5 space-y-4 animate-pulse min-h-[180px] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-16 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="w-full h-8 bg-zinc-150 dark:bg-zinc-900 rounded" />
                </div>
                <div className="w-20 h-7 bg-zinc-200 dark:bg-zinc-800 rounded self-end" />
              </div>
            ))}
          </div>
        )}

        {/* 결과 카드 렌더링 */}
        {!isLoading && result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. 팩트 폭행 카드 */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[190px] relative overflow-hidden group">
              <div className="space-y-3 relative z-10">
                <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-200/50 dark:bg-indigo-950/20 dark:border-indigo-900/60 dark:text-indigo-400 px-2 py-0.5 rounded">
                  도발적인 팩트 폭행 💥
                </span>
                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-bold">
                  "{result.fact}"
                </p>
              </div>
              <div className="mt-4 flex justify-end relative z-10">
                <button
                  onClick={() => handleCopy("fact", result.fact)}
                  className={`py-1.5 px-3 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    copiedKey === "fact"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                      : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  {copiedKey === "fact" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "fact" ? "복사 완료" : "복사하기"}</span>
                </button>
              </div>
            </div>

            {/* 2. 감성적인 공감 카드 */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[190px] relative overflow-hidden group">
              <div className="space-y-3 relative z-10">
                <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 border border-rose-200/50 dark:bg-rose-950/20 dark:border-rose-900/60 dark:text-rose-400 px-2 py-0.5 rounded">
                  감성적인 공감 유도 💌
                </span>
                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-bold">
                  "{result.empathy}"
                </p>
              </div>
              <div className="mt-4 flex justify-end relative z-10">
                <button
                  onClick={() => handleCopy("empathy", result.empathy)}
                  className={`py-1.5 px-3 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    copiedKey === "empathy"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                      : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  {copiedKey === "empathy" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "empathy" ? "복사 완료" : "복사하기"}</span>
                </button>
              </div>
            </div>

            {/* 3. 호기심 질문 카드 */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[190px] relative overflow-hidden group">
              <div className="space-y-3 relative z-10">
                <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 border border-amber-200/50 dark:bg-amber-950/20 dark:border-amber-900/60 dark:text-amber-400 px-2 py-0.5 rounded">
                  호기심 극대화 질문 ❓
                </span>
                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-bold">
                  "{result.question}"
                </p>
              </div>
              <div className="mt-4 flex justify-end relative z-10">
                <button
                  onClick={() => handleCopy("question", result.question)}
                  className={`py-1.5 px-3 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    copiedKey === "question"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                      : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  {copiedKey === "question" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "question" ? "복사 완료" : "복사하기"}</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* 빈 결과 상태 */}
        {!result && !isLoading && (
          <div className="bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-900 rounded-2xl p-8 text-center text-zinc-600 dark:text-zinc-400">
            <Lightbulb className="w-8 h-8 mx-auto text-yellow-500 mb-3 animate-bounce" />
            <p className="text-sm font-bold">영상의 대략적인 주제를 위에 입력해 주세요</p>
            <p className="text-xs mt-1">SaaS 인트로 알고리즘이 바이럴 확률이 가장 높은 3초 대본 도입부 3가지를 생성합니다.</p>
          </div>
        )}
      </div>

    </div>
  );
}

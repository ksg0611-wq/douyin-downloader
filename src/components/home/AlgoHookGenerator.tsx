"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  RefreshCcw, 
  AlertCircle, 
  Lightbulb, 
  Megaphone,
  MessageSquare,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AlgoHookGeneratorProps {
  lang?: "ko" | "en";
}

interface GeneratedAlgoData {
  cta: string[];
  comment: string[];
}

const PRESETS = [
  "민감성 피부 트러블 2주 만에 가라앉히는 홈케어",
  "비전공자 직장인을 위한 퇴근 후 IT 코딩 독학 공부법",
  "월 10만 원으로 시작하는 무자본 온라인 부업 아이템",
  "자취방 좁은 원룸을 2배 넓게 쓰는 다이소 수납 꿀팁",
  "거북목과 말린 어깨 펴주는 3분 사무실 스트레칭 루틴"
];

export default function AlgoHookGenerator({ lang = "ko" }: AlgoHookGeneratorProps) {
  const [topic, setTopic] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GeneratedAlgoData | null>(null);
  const [error, setError] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async (targetTopic?: string) => {
    const activeTopic = (targetTopic ?? topic).trim();
    if (!activeTopic) {
      setError(lang === "ko" ? "영상 주제나 핵심 내용을 입력해 주세요." : "Please enter a video topic or content.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/generate-algo-hooks", {
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

  const handlePresetClick = (preset: string) => {
    setTopic(preset);
    handleGenerate(preset);
  };

  return (
    <div id="algo-hook-generator-container" className="w-full max-w-4xl mx-auto">
      {/* 타이틀 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-rose-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Megaphone className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            📢 알고리즘 폭발 CTA & 댓글 유도 멘트 생성기
            <span className="bg-gradient-to-r from-purple-500 to-rose-500 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              NEW
            </span>
          </h2>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-0.5">
            숏폼 알고리즘 점수(완독률, 저장, 공유, 댓글)를 대폭 끌어올릴 수 있는 아웃트로 멘트와 고정 댓글 질문 10종을 즉시 디자인합니다.
          </p>
        </div>
      </div>

      {/* 입력 패널 */}
      <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-5 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <label htmlFor="topic-input" className="block text-xs font-bold text-zinc-850 dark:text-zinc-300 uppercase tracking-wider px-1">
            🎯 영상 주제 또는 알고리즘을 터뜨릴 키워드 입력
          </label>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-rose-500 rounded-xl opacity-10 group-focus-within:opacity-40 transition duration-300 blur-sm pointer-events-none" />
              <input
                id="topic-input"
                type="text"
                className="relative w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-400/60 transition-colors font-sans"
                placeholder={lang === "ko" ? "예시: 비전공자를 위한 실무 코딩 공부법, 좁은 원룸 넓게 쓰는 정리정돈법" : "e.g., Practical coding tips for beginners"}
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
                  : "bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-500 hover:brightness-105 active:scale-95 shadow-purple-500/10"
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin text-zinc-500" />
                  <span>생성 중...</span>
                </>
              ) : (
                <>
                  <span>알고리즘 치트키 뽑아보기</span>
                  <span>🪄</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 퀵 추천 프리셋 */}
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block px-1">
            ⚡ 원클릭 샘플 주제 테스트
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((item, index) => (
              <button
                key={index}
                onClick={() => handlePresetClick(item)}
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

      {/* 결과 패널 */}
      <div className="space-y-6">
        {/* 로딩용 카드 스켈레톤 */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((idx) => (
              <div key={idx} className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-900 rounded-2xl p-5 space-y-4 animate-pulse min-h-[260px]">
                <div className="w-32 h-5 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="w-full h-8 bg-zinc-150 dark:bg-zinc-900 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 결과 카드 렌더링 */}
        {!isLoading && result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. CTA 문구 컬럼 */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 relative z-10 border-b border-zinc-100 dark:border-zinc-850 pb-3">
                <span className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-900/40 flex items-center justify-center">
                  <Megaphone className="w-4 h-4 text-purple-500" />
                </span>
                <h3 className="text-sm font-black text-purple-600 dark:text-purple-400">
                  🚀 행동 유도 CTA 멘트 (저장·공유·구독)
                </h3>
              </div>

              <div className="space-y-2.5 relative z-10">
                {result.cta.map((text, idx) => (
                  <div 
                    key={`cta-${idx}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 hover:border-purple-200 dark:hover:border-purple-950/60 transition-colors"
                  >
                    <span className="text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 font-bold leading-relaxed line-clamp-2">
                      "{text}"
                    </span>
                    <button
                      onClick={() => handleCopy(`cta-${idx}`, text)}
                      className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                        copiedKey === `cta-${idx}`
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                          : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-850 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-250"
                      }`}
                    >
                      {copiedKey === `cta-${idx}` ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === `cta-${idx}` ? "복사됨" : "복사"}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. 댓글 유도 질문 컬럼 */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 relative z-10 border-b border-zinc-100 dark:border-zinc-850 pb-3">
                <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-900/40 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                </span>
                <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                  💬 알고리즘 폭발 댓글 질문 (고정댓글용)
                </h3>
              </div>

              <div className="space-y-2.5 relative z-10">
                {result.comment.map((text, idx) => (
                  <div 
                    key={`comment-${idx}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 hover:border-indigo-200 dark:hover:border-indigo-950/60 transition-colors"
                  >
                    <span className="text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 font-bold leading-relaxed line-clamp-2">
                      "{text}"
                    </span>
                    <button
                      onClick={() => handleCopy(`comment-${idx}`, text)}
                      className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                        copiedKey === `comment-${idx}`
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                          : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-850 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-250"
                      }`}
                    >
                      {copiedKey === `comment-${idx}` ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === `comment-${idx}` ? "복사됨" : "복사"}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 결과 없을 때 안내 */}
        {!result && !isLoading && (
          <div className="bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-900 rounded-2xl p-8 text-center text-zinc-600 dark:text-zinc-400">
            <Lightbulb className="w-8 h-8 mx-auto text-yellow-500 mb-3 animate-bounce" />
            <p className="text-sm font-bold">제작할 영상의 키워드나 주제를 위에 입력해 주세요</p>
            <p className="text-xs mt-1">완독률과 공유/저장을 폭발시킬 아웃트로 행동유도 카피와 고정댓글 질문 10종이 즉시 디자인됩니다.</p>
          </div>
        )}
      </div>

    </div>
  );
}

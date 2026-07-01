"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  Lightbulb,
  Zap,
  Info,
  ArrowRight,
  RefreshCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sendGAEvent } from "@next/third-parties/google";

const TEMPLATES = [
  "99%가 모르는 [키워드]의 진짜 비밀",
  "제발 [키워드] 할 때 이것만은 절대 하지 마세요",
  "지금 당장 [키워드]를 시작해야 하는 소름 돋는 이유",
  "남들은 절대 안 알려주는 [키워드] 꿀팁 3가지",
  "[키워드]로 인생을 바꾼 사람들의 공통점"
];

const QUICK_TOPICS = [
  "다이어트 식단",
  "직장인 재테크",
  "인스타 떡상법",
  "퇴사 고민",
  "초간단 요리",
  "스마트폰 꿀팁"
];

export default function HookGeneratorClient() {
  const [keyword, setKeyword] = useState<string>("");
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerate = (targetKeyword?: string) => {
    const activeKeyword = (targetKeyword ?? keyword).trim();
    if (!activeKeyword) {
      setError("주제나 키워드를 입력해 주세요.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setResults([]);

    // 0.3초의 딜레이로 생성 애니메이션 느낌을 구현
    setTimeout(() => {
      const generated = TEMPLATES.map(template => template.replace(/\[키워드\]/g, activeKeyword));
      setResults(generated);
      setIsGenerating(false);
      
      try {
        sendGAEvent({ event: 'generate_click', value: 'hook_generator_client' });
      } catch (e) {
        // safe bypass
      }
    }, 400);

    if (targetKeyword) {
      setKeyword(targetKeyword);
    }
  };

  const handleCopy = async (index: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);

      try {
        sendGAEvent({ event: 'copy_click', value: 'hook_generator_client' });
      } catch (e) {
        // safe bypass
      }
    } catch (e) {
      // safe bypass
    }
  };

  return (
    <div id="hook-generator-client-container" className="w-full max-w-4xl mx-auto">
      {/* 타이틀 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
          <Zap className="w-5.5 h-5.5 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            ⚡ 터지는 1초 훅 제조기
            <span className="bg-gradient-to-r from-rose-500 to-indigo-500 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              FAST
            </span>
          </h2>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-1">
            숏폼 시청자의 시선을 1초 만에 사로잡는 강력한 오프닝 멘트를 지금 바로 생성해 보세요. 알고리즘을 해킹하는 첫 문장 기획 도구입니다.
          </p>
        </div>
      </div>

      {/* 입력 패널 */}
      <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-5 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <label htmlFor="keyword-input" className="block text-xs font-bold text-zinc-850 dark:text-zinc-300 uppercase tracking-wider px-1">
            🎯 영상의 핵심 키워드 또는 주제 입력
          </label>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-indigo-500 rounded-xl opacity-10 group-focus-within:opacity-40 transition duration-300 blur-sm pointer-events-none" />
              <input
                id="keyword-input"
                type="text"
                className="relative w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-400/60 transition-colors font-sans"
                placeholder="예: 직장인 재테크, 다이어트 식단, 1분 요리"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerate();
                }}
              />
            </div>

            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className={`py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-lg ${
                isGenerating
                  ? "bg-zinc-800 text-zinc-500 border border-zinc-700 pointer-events-none"
                  : "bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:brightness-105 active:scale-95 shadow-rose-500/10"
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin text-zinc-500" />
                  <span>제조 중...</span>
                </>
              ) : (
                <>
                  <span>훅 생성하기</span>
                  <span>🪄</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 퀵 프리셋 키워드 */}
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-550 uppercase tracking-widest block px-1">
            ⚡ 추천 인기 주제로 빠른 테스트
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_TOPICS.map((item) => (
              <button
                key={item}
                onClick={() => handleGenerate(item)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 bg-zinc-50/50 hover:bg-zinc-100 hover:border-zinc-300 dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 cursor-pointer transition-all active:scale-95"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 에러 피드백 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-950/30 dark:bg-red-950/20 dark:text-red-400 text-xs font-bold flex items-center gap-2 mb-6"
          >
            <span>⚠️ {error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 결과 영역 */}
      <div className="space-y-4">
        {isGenerating && (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-900 rounded-2xl p-5 space-y-3 animate-pulse min-h-[80px] flex items-center justify-between">
                <div className="w-2/3 h-5 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="w-16 h-8 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        )}

        {!isGenerating && results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest block px-1">
                🪄 아래의 훅 카피를 영상 오프닝이나 자막에 바로 적용하세요!
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {results.map((text, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm hover:shadow-md dark:hover:border-zinc-700 transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-500 font-black text-xs shrink-0 select-none mt-0.5">
                      0{idx + 1}
                    </span>
                    <p className="text-sm sm:text-base text-zinc-850 dark:text-zinc-150 font-bold leading-relaxed">
                      "{text}"
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(idx, text)}
                    className={`py-2 px-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      copiedIndex === idx
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                        : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 group-hover:border-rose-300 dark:group-hover:border-rose-900/50"
                    }`}
                  >
                    {copiedIndex === idx ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-400 group-hover:text-rose-450" />
                    )}
                    <span className="hidden sm:inline">
                      {copiedIndex === idx ? "복사 완료" : "복사"}
                    </span>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {!isGenerating && results.length === 0 && (
          <div className="bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-900 rounded-2xl p-8 text-center text-zinc-650 dark:text-zinc-400">
            <Lightbulb className="w-8 h-8 mx-auto text-yellow-500 mb-3 animate-bounce" />
            <p className="text-sm font-bold">영상의 핵심 키워드를 위에 입력해 주세요</p>
            <p className="text-xs mt-1">즉각 반응하는 바이럴 치트키 훅 템플릿 5가지 결과물이 생성됩니다.</p>
          </div>
        )}
      </div>

      <hr className="my-8 border-zinc-200 dark:border-zinc-800" />
      
      <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 space-y-4 leading-relaxed">
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">💡 1초 훅(Hook)이란?</h4>
          <p>
            숏폼 영상의 성공 여부는 유저가 첫 1초 만에 화면을 넘기느냐(스킵), 멈춰 서서 시청하느냐에 달려 있습니다. 첫 1초 안에 오감을 자극하고 강렬한 호기심을 부르는 도입부 타이틀과 오디오 멘트가 존재하지 않으면, 알고리즘 피드에서 도달률이 극단적으로 떨어집니다. 이 도구는 시청 심리를 해킹하여 바이럴 확률을 높여주는 검증된 5가지 프레임을 제공합니다.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">📖 활용 및 응용 팁</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>생성된 문구를 비디오의 <strong>최상단 자막</strong>으로 큼직하고 굵게 1초간 노출해 시선을 끄세요.</li>
            <li>자막과 함께 목소리(성우 또는 AI 내레이션)로 해당 오프닝 멘트를 또렷이 언급해 오디오와 비주얼의 효과를 극대화하세요.</li>
            <li>키워드를 바꾸며 여러 번 테스트해 보고, 내 영상의 컨셉과 타겟 시청자에게 가장 자연스럽게 스며드는 문장을 조합하여 사용하세요.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

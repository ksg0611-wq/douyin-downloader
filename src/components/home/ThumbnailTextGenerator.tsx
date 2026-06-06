"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  RefreshCcw, 
  AlertCircle, 
  Lightbulb, 
  Flame,
  Magnet,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ThumbnailTextGeneratorProps {
  lang?: "ko" | "en";
}

interface GeneratedTextData {
  spicy: string[];
  mild: string[];
}

const PRESETS = [
  "초간단 자취생 원팬 파스타 레시피",
  "직장인 소액으로 미국 배당주 주식 투자하기",
  "단 2주 만에 체지방 3kg 감량하는 홈트 루틴",
  "인스타그램 릴스 팔로워 급상승 꿀팁",
  "왕초보도 5분 만에 끝내는 PPT 레이아웃 디자인",
  "영어 회화 하루 10문장으로 귀 뚫는 방법"
];

export default function ThumbnailTextGenerator({ lang = "ko" }: ThumbnailTextGeneratorProps) {
  const [topic, setTopic] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<GeneratedTextData | null>(null);
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
      const response = await fetch("/api/generate-thumbnail-text", {
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
    <div id="thumbnail-copy-generator-container" className="w-full max-w-4xl mx-auto">
      {/* 타이틀 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Magnet className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            🧲 0.1초 시선 강탈 썸네일 텍스트 생성기
            <span className="bg-gradient-to-r from-indigo-500 to-rose-500 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              NEW
            </span>
          </h2>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-0.5">
            숏폼 피드에서 유저들의 엄지손가락을 멈추게 할 짧고 파괴적인 썸네일(커버) 텍스트 10종(매운맛 5종 / 순한맛 5종)을 AI가 즉시 설계합니다.
          </p>
        </div>
      </div>

      {/* 입력 패널 */}
      <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-5 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <label htmlFor="topic-input" className="block text-xs font-bold text-zinc-850 dark:text-zinc-300 uppercase tracking-wider px-1">
            🎯 제작할 영상 주제 또는 핵심 키워드 입력
          </label>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-xl opacity-10 group-focus-within:opacity-40 transition duration-300 blur-sm pointer-events-none" />
              <input
                id="topic-input"
                type="text"
                className="relative w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-400/60 transition-colors font-sans"
                placeholder={lang === "ko" ? "예시: 하루 15분 아침 운동 루틴, 왕초보를 위한 주식 투자 핵심 가이드" : "e.g., Easy recipe for homemade Italian pasta"}
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
                  <span>추출 중...</span>
                </>
              ) : (
                <>
                  <span>썸네일 텍스트 뽑아보기</span>
                  <span>⚡</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 퀵 추천 태그 */}
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

      {/* 에러 피드백 */}
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
            
            {/* 1. 매운맛 컬럼 */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 relative z-10 border-b border-zinc-100 dark:border-zinc-850 pb-3">
                <span className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/40 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-rose-500" />
                </span>
                <h3 className="text-sm font-black text-rose-600 dark:text-rose-400">
                  🔥 매운맛 썸네일 카피 (호기심 극대화)
                </h3>
              </div>

              <div className="space-y-2.5 relative z-10">
                {result.spicy.map((text, idx) => (
                  <div 
                    key={`spicy-${idx}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 hover:border-rose-200 dark:hover:border-rose-950/60 transition-colors"
                  >
                    <span className="text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 font-bold leading-relaxed line-clamp-1">
                      "{text}"
                    </span>
                    <button
                      onClick={() => handleCopy(`spicy-${idx}`, text)}
                      className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                        copiedKey === `spicy-${idx}`
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                          : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-850 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-250"
                      }`}
                    >
                      {copiedKey === `spicy-${idx}` ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === `spicy-${idx}` ? "복사됨" : "복사"}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. 순한맛 컬럼 */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 relative z-10 border-b border-zinc-100 dark:border-zinc-850 pb-3">
                <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-900/40 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-indigo-500" />
                </span>
                <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                  💡 순한맛 썸네일 카피 (정보 및 전문성)
                </h3>
              </div>

              <div className="space-y-2.5 relative z-10">
                {result.mild.map((text, idx) => (
                  <div 
                    key={`mild-${idx}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 hover:border-indigo-200 dark:hover:border-indigo-950/60 transition-colors"
                  >
                    <span className="text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 font-bold leading-relaxed line-clamp-1">
                      "{text}"
                    </span>
                    <button
                      onClick={() => handleCopy(`mild-${idx}`, text)}
                      className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                        copiedKey === `mild-${idx}`
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                          : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-850 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-250"
                      }`}
                    >
                      {copiedKey === `mild-${idx}` ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === `mild-${idx}` ? "복사됨" : "복사"}</span>
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
            <p className="text-sm font-bold">제작할 영상의 키워드나 주제를 입력해 주세요</p>
            <p className="text-xs mt-1">알고리즘 노출 단계에서 높은 클릭을 유도하도록 최적화된 썸네일 카피 10종이 즉시 디자인됩니다.</p>
          </div>
        )}
      </div>

      <hr className="my-8 border-zinc-200 dark:border-zinc-800" />
      
      <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 space-y-4 leading-relaxed">
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">💡 0.1초 시선 강탈 썸네일 텍스트 생성기의 필요성</h4>
          <p>
            숏폼 영상의 성공을 결정짓는 핵심 지표 중 하나는 바로 피드 노출 시 유저가 영상을 클릭하는 확률(클릭률, CTR)입니다. 이 도구는 유저들의 스크롤을 0.1초 만에 멈추게 만들 수 있도록 자극적이고 호기심을 극대화하는 매운맛 카피와 전문성 및 핵심 정보 혜택을 명확히 제시하는 순한맛 카피 10종을 즉시 디자인하여 크리에이터의 유입률 고민을 해결해 줍니다.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">📖 100% 활용 가이드</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>1단계 (핵심 키워드 입력):</strong> 제작할 동영상의 핵심 주제나 제목 후보를 입력 창에 간결하게 작성합니다.</li>
            <li><strong>2단계 (카피 뽑기):</strong> '썸네일 텍스트 뽑아보기' 버튼을 눌러 AI가 제안하는 10가지 컨셉을 확인합니다.</li>
            <li><strong>3단계 (썸네일 제작):</strong> 내 영상의 분위기에 어울리는 카피를 복사하여 썸네일(커버) 디자인의 중심에 크게 배치합니다.</li>
          </ol>
        </div>
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">🔥 크리에이터 실전 꿀팁</h4>
          <p>
            썸네일 텍스트를 배치할 때는 폰트 크기를 매우 크게 하고 배경색과 뚜렷한 보색 대비를 이루게 설정하여 가독성을 극대화해야 합니다. 모바일 화면 크기는 생각보다 작기 때문에 텍스트가 12자를 넘지 않도록 간결하게 구성하는 것이 효과적이며, 제목과 썸네일 텍스트의 내용을 다르게 구성하여 호기심과 정보를 유기적으로 매칭시키는 것이 클릭을 유도하는 검증된 마케팅 기법입니다.
          </p>
        </div>
      </div>

    </div>
  );
}

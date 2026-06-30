"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Calculator, 
  RefreshCcw, 
  Copy, 
  CheckCircle2, 
  Music, 
  Sparkles, 
  Clock,
  Zap,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BPMCalculatorProps {
  lang?: "ko" | "en";
}

export default function BPMCalculator({ lang = "ko" }: BPMCalculatorProps) {
  const [taps, setTaps] = useState<number[]>([]);
  const [bpm, setBpm] = useState<number | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isTapping, setIsTapping] = useState<boolean>(false);
  const [waveTrigger, setWaveTrigger] = useState<number>(0);
  
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 탭 입력 시 실시간 BPM 계산
  const handleTap = () => {
    const now = Date.now();
    
    // 시각 파동 애니메이션 트리거
    setWaveTrigger(prev => prev + 1);
    setIsTapping(true);
    setTimeout(() => setIsTapping(false), 150);

    // 자동 리셋 타이머 갱신 (3초간 탭하지 않으면 자동 리셋)
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    
    resetTimerRef.current = setTimeout(() => {
      handleReset();
    }, 3000);

    setTaps(prevTaps => {
      const newTaps = [...prevTaps, now];
      
      // 최근 10개의 탭 타임스탬프만 유지 (보다 정확한 실시간 비트 반영)
      const slicedTaps = newTaps.slice(-10);
      
      if (slicedTaps.length >= 2) {
        // 인접한 탭 간의 간격(Interval) 계산
        let totalInterval = 0;
        for (let i = 1; i < slicedTaps.length; i++) {
          totalInterval += (slicedTaps[i] - slicedTaps[i - 1]);
        }
        const averageInterval = totalInterval / (slicedTaps.length - 1);
        
        // BPM 계산: 60,000ms / 평균 간격(ms)
        const calculatedBpm = 60000 / averageInterval;
        setBpm(Math.round(calculatedBpm));
      }
      
      return slicedTaps;
    });
  };

  // 측정 수치 초기화
  const handleReset = () => {
    setTaps([]);
    setBpm(null);
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  };

  // 컴포넌트 언마운트 시 타이머 클리어
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  // 컷편집 길이 계산 (초 단위, 소수점 3자리)
  const getCutTimes = () => {
    if (!bpm) return { beat1: "0.000", beat2: "0.000", beat4: "0.000" };
    // 60 / BPM = 1비트의 길이(초)
    const beat1 = 60 / bpm;
    const beat2 = beat1 / 2;
    const beat4 = beat1 / 4;
    return {
      beat1: beat1.toFixed(3),
      beat2: beat2.toFixed(3),
      beat4: beat4.toFixed(3)
    };
  };

  const cutTimes = getCutTimes();

  // 결과 복사 기능
  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(key);
      setTimeout(() => setCopiedText(null), 1500);
    } catch (err) {
      // 복사 오류 safe bypass
    }
  };

  return (
    <div id="bpm-calculator-container" className="w-full max-w-4xl mx-auto">
      {/* 타이틀 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            🧮 BGM 컷편집 계산기 (BGM Beat-Sync Editor)
            <span className="bg-gradient-to-r from-rose-500 to-cyan-400 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              NEW
            </span>
          </h2>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-1">
            본 도구는 음악 비트에 반응하여 화면 컷을 정밀하게 나누기 위해 실시간으로 곡의 BPM을 측정하고 적정 초(Seconds)를 연산합니다. 오디오 리듬에 맞춰 공간 바를 탭하면, 음악 템포에 딱 맞아떨어지는 1/2/4 비트당 프레임 구간 길이를 소수점 단위로 자동 산출합니다.
          </p>
        </div>
      </div>

      {/* 메인 레이아웃 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* LEFT: 탭 구역 */}
        <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-2xl flex flex-col items-center justify-center relative overflow-hidden min-h-[360px]">
          {/* 배경 오라 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* 실시간 BPM 스크린 */}
          <div className="text-center mb-8 relative z-10">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block mb-1">
              {bpm ? "MEASURED BPM" : "TAP TO START"}
            </span>
            <div className="text-5xl sm:text-6xl font-black font-mono text-zinc-900 dark:text-white filter drop-shadow-sm flex items-baseline justify-center gap-1.5">
              {bpm ? bpm : "---"}
              {bpm && <span className="text-sm font-black text-rose-500 tracking-wider">BPM</span>}
            </div>
            {taps.length > 0 && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 font-medium">
                ⏱️ {taps.length}비트 누적 중 (3초 무입력 시 자동 초기화)
              </p>
            )}
          </div>

          {/* 거대 TAP 버튼 */}
          <div className="relative flex items-center justify-center w-40 h-40">
            {/* 탭 반응성 파동 이펙트 */}
            <AnimatePresence>
              {isTapping && (
                <motion.div
                  key={waveTrigger}
                  initial={{ opacity: 0.6, scale: 0.9 }}
                  animate={{ opacity: 0, scale: 1.6 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border-4 border-rose-500/40 pointer-events-none"
                />
              )}
            </AnimatePresence>

            <button
              onMouseDown={handleTap}
              onTouchStart={(e) => {
                e.preventDefault(); // 더블 탭 확대 방지
                handleTap();
              }}
              className={`w-36 h-36 rounded-full font-black text-xl tracking-widest text-white shadow-xl flex items-center justify-center cursor-pointer transition-all duration-100 select-none bg-gradient-to-tr from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 active:scale-90 border-4 border-white dark:border-zinc-900 ${
                isTapping ? "brightness-90 scale-95" : ""
              }`}
            >
              TAP
            </button>
          </div>

          {/* 리셋 버튼 */}
          {taps.length > 0 && (
            <button
              onClick={handleReset}
              className="mt-8 inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-zinc-250 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-400 cursor-pointer transition-all active:scale-95"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>측정 초기화</span>
            </button>
          )}
        </div>

        {/* RIGHT: 계산기 결과 테이블 */}
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl">
            <h3 className="text-xs font-bold text-zinc-850 dark:text-zinc-300 uppercase tracking-wider mb-4 px-1 flex items-center gap-1.5">
              <Music className="w-4 h-4 text-rose-500" />
              <span>추천 컷편집 싱크 길이 (초)</span>
            </h3>

            {/* 3단 카드 그리드 */}
            <div className="space-y-3.5">
              
              {/* 1 Beat Card */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block">
                    1 비트 컷 (1 Beat Cut)
                  </span>
                  <div className="text-2xl font-black font-mono text-zinc-900 dark:text-white">
                    {cutTimes.beat1} <span className="text-xs font-bold text-zinc-500">초</span>
                  </div>
                </div>
                
                <button
                  disabled={!bpm}
                  onClick={() => handleCopy("beat1", cutTimes.beat1)}
                  className={`p-2 rounded-lg border transition-all ${
                    !bpm 
                      ? "opacity-30 cursor-not-allowed border-zinc-200 dark:border-zinc-850 text-zinc-400" 
                      : copiedText === "beat1"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                      : "bg-white border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-200 cursor-pointer"
                  }`}
                  title="복사하기"
                >
                  {copiedText === "beat1" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* 1/2 Beat Card */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block">
                    0.5 비트 컷 (1/2 Beat Cut)
                  </span>
                  <div className="text-2xl font-black font-mono text-zinc-900 dark:text-white">
                    {cutTimes.beat2} <span className="text-xs font-bold text-zinc-500">초</span>
                  </div>
                </div>
                
                <button
                  disabled={!bpm}
                  onClick={() => handleCopy("beat2", cutTimes.beat2)}
                  className={`p-2 rounded-lg border transition-all ${
                    !bpm 
                      ? "opacity-30 cursor-not-allowed border-zinc-200 dark:border-zinc-850 text-zinc-400" 
                      : copiedText === "beat2"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                      : "bg-white border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-200 cursor-pointer"
                  }`}
                  title="복사하기"
                >
                  {copiedText === "beat2" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* 1/4 Beat Card */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block">
                    0.25 비트 컷 (1/4 Beat Cut)
                  </span>
                  <div className="text-2xl font-black font-mono text-zinc-900 dark:text-white">
                    {cutTimes.beat4} <span className="text-xs font-bold text-zinc-500">초</span>
                  </div>
                </div>
                
                <button
                  disabled={!bpm}
                  onClick={() => handleCopy("beat4", cutTimes.beat4)}
                  className={`p-2 rounded-lg border transition-all ${
                    !bpm 
                      ? "opacity-30 cursor-not-allowed border-zinc-200 dark:border-zinc-850 text-zinc-400" 
                      : copiedText === "beat4"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                      : "bg-white border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-200 cursor-pointer"
                  }`}
                  title="복사하기"
                >
                  {copiedText === "beat4" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

            </div>
          </div>

          {/* 가이드 배너 */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-900 rounded-2xl text-xs text-zinc-700 dark:text-zinc-400 leading-relaxed space-y-1 flex gap-2">
            <Info className="w-4 h-4 text-zinc-450 dark:text-zinc-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-zinc-850 dark:text-zinc-200 mb-0.5">비디오 비트싱크 가이드</h4>
              <span>음악의 주요 강박(예: 드럼 비트, 킥 소리 등)이 울릴 때 박자에 맞춰 TAP 버튼을 4~5회 이상 치면 오차범위가 보정된 평균 BPM이 생성됩니다. 1비트 컷은 일반 속도의 트랜지션에 사용하며, 1/2 및 1/4 비트 컷은 빠른 컷 전환이나 템포 높은 영상 합성 작업에 적절합니다.</span>
            </div>
          </div>
        </div>

      </div>

      <hr className="my-8 border-zinc-200 dark:border-zinc-800" />
      
      <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 space-y-4 leading-relaxed">
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">💡 숏폼 BGM 컷편집 계산기의 필요성</h4>
          <p>
            숏폼 영상(쇼츠, 릴스, 틱톡)의 중독성과 시청 지속 시간(Retention)을 결정짓는 가장 강력한 요소 중 하나는 배경 음악(BGM)의 비트와 비주얼 화면 전환(컷편집)의 완벽한 일치성입니다. 음악의 드럼 킥이나 멜로디 박자에 딱 맞춰 화면이 넘어가는 이른바 '비트싱크' 편집은 시청자에게 극도의 시각적·청각적 쾌감을 유발하지만, 수동으로 타임라인 프레임을 보며 초 단위를 맞추는 작업은 매우 번거롭고 시간이 오래 걸립니다. 이 BGM 컷편집 계산기는 사용자가 음악을 들으며 간단히 화면을 두드리는 것만으로도 실시간 음원의 정확한 분당 비트수(BPM)를 도출하고, 이에 매핑되는 1비트, 0.5비트, 0.25비트 단위의 세밀한 편집 프레임 타임값을 밀리초(ms) 단위까지 즉시 계산해 주는 강력한 프로덕션 보조 도구입니다.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">📖 100% 활용 가이드</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>1단계 (음악 재생 및 탭):</strong> 편집에 사용할 배경 음악(BGM)을 틀어두고, 비트의 템포(박자)에 맞춰 중앙의 빨간색 'TAP' 버튼을 리드미컬하게 4회 이상 연속 클릭합니다.</li>
            <li><strong>2단계 (BPM 및 싱크초 확인):</strong> 화면 상단에 측정된 실시간 BPM 지수를 확인하고, 오른쪽에 연산된 1비트 컷, 0.5비트 컷, 0.25비트 컷에 해당하는 정확한 싱크 시간(초)을 대조합니다.</li>
            <li><strong>3단계 (컷편집 적용):</strong> 우측 복사 버튼을 눌러 소수점 3자리 피드 초 값을 복사한 뒤, 프리미어 프로나 캡컷(CapCut) 등 편집 프로그램의 클립 길이 설정 창에 입력하여 정밀 비트싱크 컷편집을 완성합니다.</li>
          </ol>
        </div>
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-250 mb-1">🔥 크리에이터 실전 꿀팁</h4>
          <p>
            일반적인 숏폼 편집에서는 처음부터 끝까지 1비트 컷으로만 편집하면 영상이 다소 단조롭게 느껴질 수 있습니다. 평조의 인트로 영역에서는 1비트 컷 단위로 여유 있게 컷을 전환하다가, 영상의 하이라이트(드롭) 구간이나 빠른 속도의 제품 소개 영역에서는 0.5비트 컷이나 0.25비트 컷으로 전환 주기를 급격히 좁혀 줌으로써 시청자의 몰입도와 알고리즘 도달 지수를 극대화할 수 있습니다.
          </p>
        </div>
      </div>

    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Lightbulb,
  Sparkles,
  RefreshCcw,
  BookOpen,
  BarChart2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sendGAEvent } from "@next/third-parties/google";

interface SentenceAnalysis {
  text: string;
  charCount: number;
  charCountNoSpace: number;
  isTooLong: boolean;
  estimatedSeconds: number;
}

const SAMPLE_SCRIPT = 
  "여기에 숏폼 영상 대본을 입력해 보세요. 예를 들어, 이 문장은 아주 정상적인 호흡의 문장입니다.\n\n" +
  "하지만 여러분이 대본을 작성할 때 마침표를 찍지 않고 쉼표만 계속 써가면서 50자 이상의 엄청나게 긴 문장을 이어서 쓰게 된다면, 시청자가 영상을 보면서 숨이 턱 막히고 호흡 조절이 되지 않아 지루함을 느끼며 영상을 끝까지 보지 않고 스와이프하여 이탈해 버릴 가능성이 200% 증가하게 됩니다.\n\n" +
  "따라서 숏폼 대본은 반드시 적절한 타이밍에 문장을 잘라서 쪼개야 시청 지속률을 끝까지 지킬 수 있습니다.";

export default function TempoCalculatorClient() {
  const [script, setScript] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [hasAnalyzed, setHasAnalyzed] = useState<boolean>(false);

  // 1초당 한글 평균 말하기 속도 (공백 포함 약 5.5자)
  const CHARS_PER_SECOND = 5.5;

  const handleAnalyze = () => {
    if (!script.trim()) return;
    setIsAnalyzing(true);
    
    setTimeout(() => {
      setHasAnalyzed(true);
      setIsAnalyzing(false);
      
      try {
        sendGAEvent({ event: "generate_click", value: "tempo_calculator" });
      } catch (e) {
        // safe bypass
      }
    }, 450);
  };

  const handleQuickLoad = () => {
    setScript(SAMPLE_SCRIPT);
    setHasAnalyzed(false);
  };

  const handleReset = () => {
    setScript("");
    setHasAnalyzed(false);
  };

  // 문장별 분석 연산
  const analysisData = useMemo(() => {
    if (!script.trim()) return null;

    // 온점, 물음표, 느낌표, 줄바꿈 기준으로 문장 분리
    const rawSentences = script
      .split(/(?<=[.?!])|\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let totalChars = 0;
    const items: SentenceAnalysis[] = rawSentences.map(text => {
      const charCount = text.length;
      const charCountNoSpace = text.replace(/\s+/g, "").length;
      totalChars += charCount;
      
      return {
        text,
        charCount,
        charCountNoSpace,
        // 공백 제외 50자 이상이면 위험 구간
        isTooLong: charCountNoSpace >= 50,
        estimatedSeconds: Number((charCount / CHARS_PER_SECOND).toFixed(1))
      };
    });

    const totalSeconds = Math.max(1, Math.round(totalChars / CHARS_PER_SECOND));
    const tooLongCount = items.filter(item => item.isTooLong).length;

    return {
      sentences: items,
      totalChars,
      totalSeconds,
      tooLongCount,
      dangerRatio: Math.round((tooLongCount / Math.max(1, items.length)) * 100)
    };
  }, [script]);

  // 예상 시간에 따른 숏폼 최적 템포 가이드 정보
  const getTimelineGuide = (seconds: number) => {
    if (seconds <= 15) {
      return {
        title: "⚡ 초압축 하이퍼 템포 (틱톡/쇼츠 바이럴 최적)",
        desc: "15초 이하의 영상은 시청자 완독률이 극대화되는 황금 구간입니다. 이탈할 틈을 주지 않는 빠른 템포와 컷편집이 요구됩니다.",
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        progressColor: "bg-emerald-500",
        score: "완독률 방어 최상"
      };
    }
    if (seconds <= 30) {
      return {
        title: "🔥 마이크로 밸런스 템포 (정보성 숏폼 표준)",
        desc: "15~30초는 유용한 팁이나 핵심 정보를 조목조목 전달하기 좋은 밸런스 구간입니다. 긴장감 넘치는 효과음과 빠른 배속 멘트가 권장됩니다.",
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        progressColor: "bg-amber-500",
        score: "가독성 밸런스 우수"
      };
    }
    if (seconds <= 60) {
      return {
        title: "📊 스토리텔링 템포 (정보 및 깊이감 보유)",
        desc: "30~60초는 서사와 스토리텔링이 가미된 숏폼입니다. 30초 부근에서 시청자 이탈 고비가 찾아오므로, 문장 중간중간에 반전(Hook) 요소를 추가하세요.",
        color: "text-sky-500 bg-sky-500/10 border-sky-500/20",
        progressColor: "bg-sky-500",
        score: "스토리 이탈 관리 필요"
      };
    }
    return {
      title: "⚠️ 롱폼 전환 경고 (숏폼 기준 시간 초과)",
      desc: "60초를 넘어가면 숏폼 플랫폼 피드 노출 메커니즘에서 패널티를 받을 수 있으며, 완독률 방어가 매우 힘들어집니다. 대본을 2편으로 쪼개거나 30% 이상 요약하십시오.",
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      progressColor: "bg-rose-500",
      score: "이탈률 위험 매우 높음"
    };
  };

  const timelineInfo = useMemo(() => {
    if (!analysisData) return null;
    return getTimelineGuide(analysisData.totalSeconds);
  }, [analysisData]);

  return (
    <div id="tempo-calculator-container" className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* 타이틀 헤더 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-rose-500/20 animate-pulse">
          <Clock className="w-5.5 h-5.5 text-white" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            ⏱️ 숏폼 템포 & 이탈률 방어 계산기
            <span className="bg-gradient-to-r from-rose-500 to-indigo-500 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              TEMPO
            </span>
          </h2>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-1">
            내 숏폼 대본의 호흡을 분석해 이탈률을 유발할 수 있는 50자 이상의 긴 문장(위험 구간)을 스캔하고, 예상 영상 길이를 계산합니다.
          </p>
        </div>
      </div>

      {/* 입력 패널 */}
      <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <label htmlFor="script-textarea" className="block text-xs font-bold text-zinc-850 dark:text-zinc-300 uppercase tracking-wider px-1">
              📝 대본 텍스트 입력
            </label>
            <div className="flex gap-2">
              <button 
                onClick={handleQuickLoad}
                className="text-[10px] font-extrabold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>💡 샘플 대본 채우기</span>
              </button>
              {script && (
                <button 
                  onClick={handleReset}
                  className="text-[10px] font-extrabold text-zinc-500 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>비우기</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-indigo-500 rounded-xl opacity-10 group-focus-within:opacity-30 transition duration-300 blur-sm pointer-events-none" />
            <textarea
              id="script-textarea"
              rows={8}
              className="relative w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-450 transition-colors font-sans resize-y leading-relaxed"
              placeholder="여기에 준비한 쇼츠/릴스/틱톡 영상 대본을 입력하거나 복사해서 붙여넣으세요..."
              value={script}
              onChange={(e) => {
                setScript(e.target.value);
                setHasAnalyzed(false);
              }}
            />
          </div>
        </div>

        <div className="flex justify-end relative z-10">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !script.trim()}
            className={`py-3 px-8 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg ${
              isAnalyzing || !script.trim()
                ? "bg-zinc-800 text-zinc-500 border border-zinc-700 pointer-events-none"
                : "bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:brightness-105 active:scale-95 shadow-rose-500/10"
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCcw className="w-4 h-4 animate-spin text-zinc-500" />
                <span>대본 호흡 분석 중...</span>
              </>
            ) : (
              <>
                <span>대본 분석하기</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 분석 결과 */}
      <AnimatePresence>
        {hasAnalyzed && analysisData && timelineInfo && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="space-y-6"
          >
            
            {/* 예상 지속 시간 및 이탈 위험 요약 보드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider block">
                  ⏱️ 예상 지속 시간
                </span>
                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-rose-500 tracking-tight">
                    {analysisData.totalSeconds}
                  </span>
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-400">초</span>
                </div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-2 block">
                  (글자 수 공백 포함 {analysisData.totalChars}자 분석 기준)
                </span>
              </div>

              <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider block">
                  🚨 긴 문장 감지 (호흡 경고)
                </span>
                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span className={`text-3xl font-black tracking-tight ${analysisData.tooLongCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {analysisData.tooLongCount}
                  </span>
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-400">문장</span>
                </div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-2 block">
                  (공백 제외 50자 이상 문장 카운트)
                </span>
              </div>

              <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-500 tracking-wider block">
                  🎯 이탈 유발 구간 비중
                </span>
                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span className={`text-3xl font-black tracking-tight ${analysisData.dangerRatio >= 30 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {analysisData.dangerRatio}%
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-2 block">
                  (전체 문장 중 호흡 긴 문장 비율)
                </span>
              </div>

            </div>

            {/* 타임라인 및 구간 분석 가이드 */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-zinc-850 dark:text-zinc-200 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-rose-500" />
                <span>숏폼 템포 타임라인 및 템포 분석</span>
              </h3>

              {/* Progress Timeline bar */}
              <div className="space-y-1">
                <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden relative border border-zinc-200/50 dark:border-zinc-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (analysisData.totalSeconds / 60) * 100)}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full ${timelineInfo.progressColor} rounded-full`}
                  />
                  {/* 15초선 */}
                  <div className="absolute left-[25%] top-0 bottom-0 w-0.5 bg-zinc-300 dark:bg-zinc-700/80" />
                  {/* 30초선 */}
                  <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-zinc-300 dark:bg-zinc-700/80" />
                  {/* 60초선 */}
                  <div className="absolute left-[100%] top-0 bottom-0 w-0.5 bg-zinc-300 dark:bg-zinc-700/80" />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 px-1 font-mono">
                  <span>0초</span>
                  <span className="relative right-2">15초</span>
                  <span className="relative right-1">30초</span>
                  <span>60초(초과)</span>
                </div>
              </div>

              {/* 템포 가이드 카드 */}
              <div className={`p-4 border rounded-xl space-y-2 ${timelineInfo.color}`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    {timelineInfo.title}
                  </h4>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                    {timelineInfo.score}
                  </span>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-350 leading-relaxed font-bold">
                  {timelineInfo.desc}
                </p>
              </div>

            </div>

            {/* 위험 문장 감지 리스트 (50자 이상 경고 구간 시각화) */}
            <div className="space-y-4">
              <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest block px-1">
                🚨 호흡이 너무 길어 지루할 수 있는 대본 구간 (집중 분석)
              </span>

              {analysisData.tooLongCount === 0 ? (
                <div className="p-5 border border-emerald-250 bg-emerald-50/50 dark:border-emerald-950/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 rounded-2xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold mb-1">🎉 모든 문장의 호흡이 훌륭하게 설계되었습니다!</h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      공백 제외 50자가 넘는 지루한 긴 문장이 단 하나도 감지되지 않았습니다. 이대로 숏폼 영상을 녹음/제작하셔도 전달력이 매우 뛰어날 것입니다.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {analysisData.sentences.map((item, index) => {
                    if (!item.isTooLong) return null;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white border-l-4 border-red-500 border-y border-r border-zinc-200 dark:bg-zinc-950/40 dark:border-zinc-850 rounded-r-xl p-4.5 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-900 pb-2">
                          <span className="flex items-center gap-1.5 text-xs font-extrabold text-red-500">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>가독성 경고 (호흡 위험도 최상)</span>
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-500 font-bold">
                            문장 길이 {item.charCountNoSpace}자 / 예상 소요 {item.estimatedSeconds}초
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-850 dark:text-zinc-150 font-bold leading-relaxed bg-red-500/5 dark:bg-red-500/10 p-3 rounded-lg border border-red-500/10 text-red-950 dark:text-red-300">
                          "{item.text}"
                        </p>
                        <div className="flex items-start gap-2 text-xs text-zinc-650 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-lg border border-zinc-200/50 dark:border-zinc-800">
                          <Lightbulb className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-zinc-800 dark:text-zinc-300 block mb-0.5">💡 이탈률 방어 처방</span>
                            <span>
                              해당 구간은 한 호흡에 발음하기 어렵고 시각적으로 피로도가 높습니다. <strong>쉼표나 온점을 활용해 문장을 2개로 완전히 분할</strong>하십시오. 혹은 컷편집 시 이 구간에 반드시 참고 자료화면(B-roll), 텍스트 레이아웃 반전, 줌인/줌아웃 효과를 적용해 이탈률을 억제하십시오.
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 전체 문장 가독성 타임라인 리스트 */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-zinc-850 dark:text-zinc-200 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-rose-500" />
                <span>대본 전체 시퀀스 분석 피드백</span>
              </h3>
              
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {analysisData.sentences.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all flex items-start justify-between gap-3 ${
                      item.isTooLong
                        ? "bg-red-50/50 border-red-200 text-red-900 dark:bg-red-950/15 dark:border-red-950/40 dark:text-red-400 font-extrabold"
                        : "bg-zinc-50/50 border-zinc-200 text-zinc-700 dark:bg-zinc-900/40 dark:border-zinc-850 dark:text-zinc-400"
                    }`}
                  >
                    <div className="flex gap-2.5">
                      <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black shrink-0 ${
                        item.isTooLong
                          ? "bg-red-500 text-white"
                          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                      }`}>
                        {idx + 1}
                      </span>
                      <span>{item.text}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-550 dark:text-zinc-500 shrink-0 font-bold">
                      {item.estimatedSeconds}초 ({item.charCountNoSpace}자)
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      <hr className="my-8 border-zinc-200 dark:border-zinc-800" />
      
      {/* 팁 정보 */}
      <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 space-y-4 leading-relaxed">
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">💡 숏폼 영상 이탈률(Retention) 방어가 중요한 이유</h4>
          <p>
            유튜브 쇼츠, 틱톡, 인스타그램 릴스 알고리즘은 <strong>'시청 지속률(Average View Duration)'</strong>과 <strong>'완독률(Completion Rate)'</strong>을 핵심 지표로 가중치를 부여합니다. 시청자가 영상 시작 2~3초 이내에 넘어가거나, 대본이 지루해지는 중간 구간에서 급격하게 스와이프를 하면 비디오의 추천 풀이 강제로 축소됩니다. 숏폼 전용 템포 계산기를 활용하여 긴 문장을 극단적으로 압축함으로써 초반 이탈률 방어와 지속적인 트랙션을 획득할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

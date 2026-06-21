"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  RefreshCcw, 
  AlertCircle, 
  Lightbulb, 
  Zap,
  TrendingUp,
  Target,
  Brain,
  ChevronRight,
  FolderHeart,
  Check,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sendGAEvent } from "@next/third-parties/google";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface ViralAnalyzerProps {
  lang?: "ko" | "en";
}

interface AnalysisData {
  hook: string;
  body: string;
  cta: string;
  ideas: string[];
}

const SAMPLE_SCRIPTS = [
  {
    title: "💰 재테크 마케팅 대본",
    script: "혹시 아직도 적금만 들고 계신가요? 10년 뒤에 무조건 땅을 치고 후회합니다. 화폐 가치는 매년 떨어지는데 은행 이자는 고작 2%죠. 지금 당장 월 10만 원이라도 미국 지수 추종 ETF에 묻어두세요. 어떻게 시작하는지 프로필 링크에 무료 가이드라인으로 정리해 뒀으니 지금 당장 확인해 보세요!"
  },
  {
    title: "🍳 요리/레시피 대본",
    script: "라면 맛있게 끓이는 법, 제발 일반 스프만 넣지 마세요. 이 '한 큰술'만 추가하면 10배 깊은 국물 맛이 납니다. 바로 국간장과 다진 마늘 0.5큰술인데요, 면을 넣기 전에 국물에 먼저 볶아주듯 끓여내는 게 핵심입니다. 더 자세한 레시피 순서와 황금 비율은 하단 고정 댓글의 더보기를 클릭하세요!"
  },
  {
    title: "📈 퍼스널 브랜딩 대본",
    script: "팔로워 100명에서 1만 명으로 한 달 만에 키운 떡상 치트키를 공개합니다. 대부분 해시태그나 화질에만 집착하는데 진짜 중요한 건 첫 3초 인트로 텍스트입니다. 독자가 멈추지 않을 수 없는 강한 호기심 유발 문구를 작성하는 공식을 개발했습니다. 제 인스타 계정을 팔로우하시고 '치트키'라고 DM 보내주시면 풀버전 PDF 파일 바로 보내드릴게요!"
  }
];

export default function ViralAnalyzer({ lang = "ko" }: ViralAnalyzerProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { user, signInWithGoogle } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  const handleSaveToToolbox = async () => {
    if (!result) return;
    if (!user) {
      alert("로그인 후 이용할 수 있는 기능입니다.");
      try {
        await signInWithGoogle();
      } catch (err) {
        console.error("로그인 실패:", err);
      }
      return;
    }

    if (!db) {
      alert("Firebase 설정을 확인해 주세요.");
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(db, "users", user.uid, "history"), {
        toolId: "viral-analyzer",
        toolName: "AI 바이럴 영상 역설계 분석기",
        inputData: {
          content: content.trim()
        },
        resultData: result,
        isFallback: isFallback,
        createdAt: serverTimestamp()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      alert("내 도구상자에 저장되었습니다!");
    } catch (err: any) {
      console.error("[ViralAnalyzer] Firestore 저장 실패:", err);
      if (err?.code === "permission-denied") {
        alert("저장 권한이 없습니다. 로그인 상태를 확인해 주세요.");
      } else {
        alert("저장에 실패했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = async (targetContent?: string) => {
    const activeContent = (targetContent ?? content).trim();
    if (!activeContent) {
      setError(lang === "ko" ? "분석할 영상의 대본이나 내용을 입력해 주세요." : "Please enter the video script or content to analyze.");
      return;
    }

    setIsLoading(true);
    sendGAEvent({ event: 'generate_click', value: 'viral_analyzer' });
    setError("");
    setResult(null);
    setIsFallback(false);

    try {
      const response = await fetch("/api/analyze-viral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: activeContent })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "AI 분석 중 오류가 발생했습니다.");
      }

      setResult(data.data);
      if (data.fallback === true) {
        setIsFallback(true);
      }
      if (targetContent) {
        setContent(targetContent);
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
      sendGAEvent({ event: 'copy_click', value: 'viral_analyzer' });
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (e) {
      // safe bypass
    }
  };

  const handleQuickClick = (script: string) => {
    setContent(script);
    handleAnalyze(script);
  };

  return (
    <div id="viral-analyzer-container" className="w-full max-w-4xl mx-auto">
      {/* 타이틀 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
          <Brain className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            🔥 AI 바이럴 영상 역설계 분석기
            <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              HOT
            </span>
          </h2>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-0.5">
            인기 숏폼 비디오의 대본이나 흐름을 입력하면, 100만 조회수의 후킹 포인트와 이탈 방지 기법, 행동 유도(CTA) 전략 및 변형 아이디어를 즉시 도출합니다.
          </p>
        </div>
      </div>

      {/* 입력 패널 */}
      <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-5 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <label htmlFor="script-input" className="block text-xs font-bold text-zinc-850 dark:text-zinc-300 uppercase tracking-wider px-1">
            📝 벤치마킹할 영상의 대본 또는 내용 구성 입력
          </label>
          
          <div className="space-y-3">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-indigo-500 rounded-xl opacity-10 group-focus-within:opacity-40 transition duration-300 blur-sm pointer-events-none" />
              <textarea
                id="script-input"
                rows={5}
                className="relative w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-450 transition-colors font-sans resize-none"
                placeholder={lang === "ko" 
                  ? "분석하고자 하는 영상의 실제 자막 대본이나, 구성 흐름을 상세하게 적어주세요.\n예시) 첫 화면에 '아직도 이러시나요?' 텍스트 노출 -> 스프를 볶는 조리 장면 -> 더 자세한 레시피는 고정 댓글을 확인하라고 언급하며 종료."
                  : "Enter the script or description of the viral short-form video to analyze."}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (error) setError("");
                }}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleAnalyze()}
                disabled={isLoading}
                className={`py-3 px-6 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg w-full sm:w-auto ${
                  isLoading
                    ? "bg-zinc-800 text-zinc-500 border border-zinc-700 pointer-events-none"
                    : "bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-500 hover:brightness-105 active:scale-95 shadow-rose-500/10"
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCcw className="w-4 h-4 animate-spin text-zinc-500" />
                    <span>역설계 분석 중...</span>
                  </>
                ) : (
                  <>
                    <span>역설계 분석 시작하기</span>
                    <span>🧠</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 퀵 샘플 선택 */}
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block px-1">
            ⚡ 원클릭 샘플 대본 테스트
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SCRIPTS.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuickClick(item.script)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 bg-zinc-50/50 hover:bg-zinc-100 hover:border-zinc-300 dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 cursor-pointer transition-all active:scale-95"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fallback 모드 안내 배너 */}
      <AnimatePresence>
        {isFallback && result && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-400 text-xs font-bold flex items-center gap-2 mb-4"
          >
            <Info className="w-4 h-4 text-amber-500 shrink-0" />
            <span>⚠️ 현재 AI 서버 요청이 집중되어 샘플 데이터를 표시하고 있습니다. 잠시 후 다시 생성해 보세요!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 에러 상태 배너 */}
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

      {/* 결과 영역 */}
      <div className="space-y-6">
        {/* 로딩 스켈레톤 UI */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-900 rounded-2xl p-5 space-y-4 animate-pulse min-h-[160px] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="w-full h-12 bg-zinc-150 dark:bg-zinc-900 rounded" />
                </div>
                <div className="w-20 h-7 bg-zinc-200 dark:bg-zinc-800 rounded self-end" />
              </div>
            ))}
          </div>
        )}

        {/* 결과 카드 렌더링 */}
        {!isLoading && result && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={handleSaveToToolbox}
                disabled={isSaving}
                className={`py-2 px-3.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
                  saveSuccess
                    ? "bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-500/20 dark:border-teal-500/40 dark:text-teal-300"
                    : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                {isSaving ? (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : saveSuccess ? (
                  <Check className="w-4 h-4 text-emerald-500 animate-scale" />
                ) : (
                  <FolderHeart className="w-4 h-4 text-rose-500" />
                )}
                <span>{isSaving ? "저장 중..." : saveSuccess ? "도구상자 저장됨" : "도구상자에 전체 결과 저장"}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Hook Point */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[170px] relative overflow-hidden group">
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-amber-500" />
                  </span>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                    3초 후킹 포인트 분석 🪝
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-850 dark:text-zinc-250 leading-relaxed font-semibold">
                  {result.hook}
                </p>
              </div>
              <div className="mt-4 flex justify-end relative z-10">
                <button
                  onClick={() => handleCopy("hook", result.hook)}
                  className={`py-1.5 px-3 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    copiedKey === "hook"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                      : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  {copiedKey === "hook" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "hook" ? "복사 완료" : "분석 복사"}</span>
                </button>
              </div>
            </div>

            {/* 2. Body Strategy */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[170px] relative overflow-hidden group">
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-900/40 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                  </span>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                    이탈 방지 전개(Body) 방식 📈
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-850 dark:text-zinc-250 leading-relaxed font-semibold">
                  {result.body}
                </p>
              </div>
              <div className="mt-4 flex justify-end relative z-10">
                <button
                  onClick={() => handleCopy("body", result.body)}
                  className={`py-1.5 px-3 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    copiedKey === "body"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                      : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  {copiedKey === "body" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "body" ? "복사 완료" : "분석 복사"}</span>
                </button>
              </div>
            </div>

            {/* 3. CTA Action */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[170px] relative overflow-hidden group">
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/40 flex items-center justify-center">
                    <Target className="w-4 h-4 text-emerald-500" />
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    행동 유도(CTA) 전략 🎯
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-850 dark:text-zinc-250 leading-relaxed font-semibold">
                  {result.cta}
                </p>
              </div>
              <div className="mt-4 flex justify-end relative z-10">
                <button
                  onClick={() => handleCopy("cta", result.cta)}
                  className={`py-1.5 px-3 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    copiedKey === "cta"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                      : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  {copiedKey === "cta" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "cta" ? "복사 완료" : "분석 복사"}</span>
                </button>
              </div>
            </div>

            {/* 4. Ideas */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[170px] relative overflow-hidden group md:col-span-2">
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/40 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-rose-500" />
                  </span>
                  <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                    내 채널 적용 변형 아이디어 3가지 💡
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {result.ideas.map((idea, idx) => (
                    <div 
                      key={idx}
                      className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col justify-between space-y-3 hover:border-rose-300 dark:hover:border-rose-900 transition-colors"
                    >
                      <p className="text-xs text-zinc-800 dark:text-zinc-300 leading-relaxed font-semibold">
                        {idea}
                      </p>
                      <button
                        onClick={() => handleCopy(`idea-${idx}`, idea)}
                        className={`self-end py-1 px-2.5 rounded-md border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          copiedKey === `idea-${idx}`
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                            : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                        }`}
                      >
                        {copiedKey === `idea-${idx}` ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === `idea-${idx}` ? "복사됨" : "복사"}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

        {/* 빈 분석 상태 */}
        {!result && !isLoading && (
          <div className="bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-900 rounded-2xl p-8 text-center text-zinc-600 dark:text-zinc-400">
            <Lightbulb className="w-8 h-8 mx-auto text-yellow-500 mb-3 animate-bounce" />
            <p className="text-sm font-bold">벤치마킹할 숏폼 영상의 내용을 위에 적어주세요</p>
            <p className="text-xs mt-1">탑티어 숏폼 기획자의 관점으로 도입부, 구성, 이탈 방지 장치 및 변형 아이디어를 세밀하게 추출해 드립니다.</p>
          </div>
        )}
      </div>

      <hr className="my-8 border-zinc-200 dark:border-zinc-800" />
      
      <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 space-y-4 leading-relaxed">
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">💡 AI 바이럴 영상 역설계 분석기의 필요성</h4>
          <p>
            수많은 숏폼 영상 중 어떤 영상이 왜 알고리즘의 선택을 받았는지 파악하는 것은 성공적인 크리에이터 활동의 핵심입니다. 이 도구는 성공한 영상들의 구조적 패턴을 해체하여 누구나 쉽게 분석하고 벤치마킹할 수 있도록 돕습니다. 시청자들의 이목을 끄는 디테일과 이탈 방지 구간 설계 기법을 추출하여, 신규 기획 단계에서의 불확실성을 드라마틱하게 해소해 줍니다.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">📖 100% 활용 가이드</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>1단계 (대본 확보):</strong> 분석하고자 하는 인기 숏폼 영상의 자막이나 화면 연출 흐름을 텍스트로 자세하게 받아적어 준비합니다.</li>
            <li><strong>2단계 (AI 분석 호출):</strong> 준비한 텍스트를 위 입력 창에 넣고 '역설계 분석 시작하기' 버튼을 누릅니다.</li>
            <li><strong>3단계 (기획 접목):</strong> 추출된 3초 후킹 기법과 전개 방식을 벤치마킹하여 내 채널만의 변형 아이디어 카드를 골라 콘텐츠 제작에 적용합니다.</li>
          </ol>
        </div>
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">🔥 크리에이터 실전 꿀팁</h4>
          <p>
            성공한 대본을 분석할 때는 단순히 텍스트만 복사하는 것이 아니라, 영상에서 사용한 트랜지션 효과나 자막의 배치, 배경음악의 템포(BPM) 변화까지 함께 메모해 두는 것이 좋습니다. AI가 추천하는 변형 아이디어 중 자신의 주력 분야와 가장 궁합이 잘 맞는 형태 1가지를 타겟하여 시리즈물로 기획하면, 알고리즘 피드에 추천으로 묶여 조회수를 연속해서 흡수할 수 있습니다.
          </p>
        </div>
      </div>

    </div>
  );
}

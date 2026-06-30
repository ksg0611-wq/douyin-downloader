"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  RefreshCcw, 
  AlertCircle, 
  Lightbulb, 
  Flame,
  Brain,
  Zap,
  FolderHeart,
  Check,
  Info,
  Link2,
  Trash2,
  History,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sendGAEvent } from "@next/third-parties/google";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  limit, 
  deleteDoc, 
  doc,
  getDocs
} from "firebase/firestore";

interface ViralScriptReverseEngineerProps {
  lang?: "ko" | "en";
  defaultMode?: "video" | "text";
}

interface ScriptOutput {
  hook: string;
  body: string;
  cta: string;
}

interface ReverseEngineerResultData {
  analysis: string;
  alternative1: ScriptOutput;
  alternative2: ScriptOutput;
}

interface ViralAnalysisResultData {
  hook: string;
  body: string;
  cta: string;
  ideas: string[];
}

export default function ViralScriptReverseEngineer({ lang = "ko", defaultMode = "video" }: ViralScriptReverseEngineerProps) {
  // Input Modes: "video" (영상 링크 입력) vs "text" (대본 직접 입력)
  const [inputMode, setInputMode] = useState<"video" | "text">(defaultMode);
  
  // Input fields
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [competitorScript, setCompetitorScript] = useState<string>("");
  const [myTopic, setMyTopic] = useState<string>("");
  
  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  
  // Results
  const [reverseResult, setReverseResult] = useState<ReverseEngineerResultData | null>(null);
  const [viralResult, setViralResult] = useState<ViralAnalysisResultData | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Auth & history saving
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);

  // Load history on mount or auth change
  useEffect(() => {
    if (authLoading || !user || !user.uid) {
      setHistoryList([]);
      return;
    }
    fetchHistory();
  }, [user, authLoading]);

  const fetchHistory = async () => {
    if (!db || !user?.uid) return;
    try {
      const q = query(
        collection(db, "reverse_engineer_history"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistoryList(list);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  const handleQuickPreset = (script: string, topic: string) => {
    setInputMode("text");
    setCompetitorScript(script);
    setMyTopic(topic);
    setError("");
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

  const handleAnalyzeAndEngineer = async () => {
    setError("");
    setReverseResult(null);
    setViralResult(null);
    setIsFallback(false);

    let scriptToUse = competitorScript.trim();
    const topicToUse = myTopic.trim();

    // Validate inputs
    if (inputMode === "video") {
      if (!videoUrl.trim()) {
        setError(lang === "ko" ? "분석할 영상 링크를 입력해 주세요." : "Please enter a video URL.");
        return;
      }
    } else {
      if (!scriptToUse) {
        setError(lang === "ko" ? "경쟁자 대본 텍스트를 입력해 주세요." : "Please enter competitor script text.");
        return;
      }
    }

    setIsLoading(true);
    sendGAEvent({ event: "generate_click", value: "viral_script_reverse_engineer" });

    try {
      // 1. If in video mode, extract transcript first
      if (inputMode === "video") {
        setLoadingStep(lang === "ko" ? "영상에서 오디오 및 메타데이터를 수집하는 중..." : "Extracting video metadata...");
        
        const platform = (videoUrl.includes("xiaohongshu.com") || videoUrl.includes("xhslink.com")) ? "xiaohongshu" : "douyin";
        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: videoUrl.trim(), platform }),
        });

        const analyzeData = await analyzeRes.json();
        if (!analyzeRes.ok || !analyzeData.success) {
          throw new Error(analyzeData.error || "비디오 메타데이터 추출에 실패했습니다.");
        }

        const audioUrl = analyzeData.data.realAudioUrl;
        const videoTitle = analyzeData.data.title;

        if (!audioUrl) {
          throw new Error("분석 가능한 오디오 스트림이 존재하지 않습니다.");
        }

        setLoadingStep(lang === "ko" ? "AI가 오디오 분석 후 대본을 실시간 복원하는 중..." : "AI restoring script from audio...");
        const extractRes = await fetch("/api/extract-script", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audioUrl, videoTitle }),
        });

        const extractData = await extractRes.json();
        if (!extractRes.ok || !extractData.success) {
          throw new Error(extractData.error?.message || extractData.error || "대본 복원 중 서버 에러 발생");
        }

        // Set script details to run the core models
        scriptToUse = extractData.script;
        // Optionally populate the textarea for user reference
        setCompetitorScript(scriptToUse);
      }

      // 2. Route to specific API based on myTopic parameter
      if (topicToUse) {
        // Rewrite competitor script adaptation
        setLoadingStep(lang === "ko" ? "AI가 대본 흥행 공식을 역설계하여 채널용 대본을 작성하는 중..." : "AI rewriting competitor script for your channel...");
        const response = await fetch("/api/reverse-engineer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ competitorScript: scriptToUse, myTopic: topicToUse }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || "역설계 분석 중 오류가 발생했습니다.");
        }

        setReverseResult(data.data);
        if (data.fallback) setIsFallback(true);

        // Auto save to history
        if (db && user) {
          try {
            await addDoc(collection(db, "reverse_engineer_history"), {
              userId: user.uid,
              competitorScript: scriptToUse,
              myTopic: topicToUse,
              analysis: data.data.analysis,
              alternative1: data.data.alternative1,
              alternative2: data.data.alternative2,
              createdAt: serverTimestamp()
            });
            fetchHistory();
          } catch (dbErr) {
            console.error("Failed to auto-save history:", dbErr);
          }
        }
      } else {
        // Run structural viral analysis only
        setLoadingStep(lang === "ko" ? "AI가 3초 후킹 및 이탈률 방지 포인트를 해체 분석하는 중..." : "AI dismantling and analyzing script...");
        const response = await fetch("/api/analyze-viral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: scriptToUse }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || "AI 바이럴 분석 중 오류 발생");
        }

        setViralResult(data.data);
        if (data.fallback) setIsFallback(true);
      }
    } catch (err: any) {
      setError(err.message || "서버 통신에 실패했습니다.");
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const handleSaveToToolbox = async () => {
    if (!reverseResult) return;
    if (!user) {
      alert(lang === "ko" ? "로그인 후 보관할 수 있습니다." : "Please log in to save to toolbox.");
      try {
        await signInWithGoogle();
      } catch (err) {
        console.error("Login failed:", err);
      }
      return;
    }

    if (!db) return;

    setIsSaving(true);
    try {
      await addDoc(collection(db, "users", user.uid, "history"), {
        toolId: "reverse-engineer",
        toolName: "바이럴 영상·대본 역설계기",
        inputData: {
          competitorScript: competitorScript,
          myTopic: myTopic
        },
        resultData: reverseResult,
        isFallback: isFallback,
        createdAt: serverTimestamp()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      alert(lang === "ko" ? "내 도구상자에 보관되었습니다!" : "Saved to your toolbox!");
    } catch (err) {
      console.error("Failed to save to users history:", err);
      alert(lang === "ko" ? "보관에 실패했습니다." : "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(lang === "ko" ? "이 내역을 삭제하시겠습니까?" : "Delete this history item?")) return;
    if (!db) return;

    try {
      await deleteDoc(doc(db, "reverse_engineer_history", id));
      fetchHistory();
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  return (
    <div id="viral-script-reverse-engineer-container" className="w-full max-w-4xl mx-auto">
      {/* 1. Header & SEO Seed Text */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
          <Brain className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            🧠 바이럴 영상·대본 역설계기 (Shorts Script Reverse Engineer)
          </h2>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-1">
            본 도구는 인기 숏폼 영상의 핵심 흥행 공식을 프레임 단위로 역설계하고, 사용자의 테마에 맞춰 매운맛과 정보성 컨셉의 신규 스크립트로 즉시 재조립합니다. 경쟁사의 후킹 기법과 이탈 방지 구조를 과학적으로 분석하여 내 채널에 최적화된 맞춤형 바이럴 텍스트를 기획할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 2. Sub-tab Selection */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6">
        <button
          onClick={() => { setInputMode("video"); setError(""); }}
          className={`px-5 py-2.5 font-bold text-sm transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
            inputMode === "video"
              ? "border-rose-500 text-rose-600 dark:text-rose-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>영상 링크 분석 (Video URL)</span>
        </button>
        <button
          onClick={() => { setInputMode("text"); setError(""); }}
          className={`px-5 py-2.5 font-bold text-sm transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
            inputMode === "text"
              ? "border-rose-500 text-rose-600 dark:text-rose-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>대본 직접 입력 (Script Text)</span>
        </button>
      </div>

      {/* 3. Input Panels */}
      <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-5 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        {inputMode === "video" ? (
          <div className="space-y-4 relative z-10">
            <div className="space-y-2">
              <label htmlFor="video-url-input" className="block text-xs font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider px-1">
                🔗 분석할 도우인 / 샤오홍슈 영상 링크
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-indigo-500 rounded-xl opacity-10 group-focus-within:opacity-30 transition duration-300 blur-sm pointer-events-none" />
                <div className="relative flex items-center">
                  <Link2 className="absolute left-4 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                  <input
                    id="video-url-input"
                    type="text"
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-zinc-850 dark:text-zinc-100 focus:outline-none focus:border-rose-500 transition-colors font-sans"
                    placeholder="https://v.douyin.com/... 또는 https://www.xiaohongshu.com/..."
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      if (error) setError("");
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            <div className="space-y-2">
              <label htmlFor="script-textarea" className="block text-xs font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider px-1">
                📝 벤치마킹할 경쟁사의 숏폼 대본 텍스트 입력
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-indigo-500 rounded-xl opacity-10 group-focus-within:opacity-30 transition duration-300 blur-sm pointer-events-none" />
                <textarea
                  id="script-textarea"
                  rows={4}
                  className="relative w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors resize-none"
                  placeholder="대본 텍스트를 붙여넣어 주세요. (예: 돈 많은 부자들이 절대 사지 않는 3가지가 있습니다...)"
                  value={competitorScript}
                  onChange={(e) => {
                    setCompetitorScript(e.target.value);
                    if (error) setError("");
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Common Target Topic Field */}
        <div className="space-y-2 relative z-10">
          <label htmlFor="my-topic-input" className="block text-xs font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider px-1">
            🎯 내 채널의 목표 주제 (입력 시 변형 대본 2종 자동 생성)
          </label>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-indigo-500 rounded-xl opacity-10 group-focus-within:opacity-30 transition duration-300 blur-sm pointer-events-none" />
            <input
              id="my-topic-input"
              type="text"
              className="relative w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-850 dark:text-zinc-100 focus:outline-none focus:border-rose-500 transition-colors font-sans"
              placeholder="공백으로 둘 경우 리라이팅 대본 생성 없이 구조적 3초 후킹 및 이탈 요소만 분석합니다."
              value={myTopic}
              onChange={(e) => {
                setMyTopic(e.target.value);
                if (error) setError("");
              }}
            />
          </div>
        </div>

        <div className="flex justify-end relative z-10">
          <button
            onClick={handleAnalyzeAndEngineer}
            disabled={isLoading}
            className={`py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg w-full sm:w-auto ${
              isLoading
                ? "bg-zinc-800 text-zinc-500 border border-zinc-700 pointer-events-none"
                : "bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-500 hover:brightness-105 active:scale-95 shadow-rose-500/10"
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCcw className="w-4 h-4 animate-spin text-zinc-500" />
                <span>분석 및 리라이팅 진행 중...</span>
              </>
            ) : (
              <>
                <span>분석 및 역설계 시작</span>
                <span>🧠</span>
              </>
            )}
          </button>
        </div>

        {/* Loading Step display */}
        <AnimatePresence>
          {isLoading && loadingStep && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2 border-t border-zinc-100 dark:border-zinc-900 text-center"
            >
              <div className="bg-rose-50/30 border border-rose-100 dark:bg-rose-950/10 dark:border-rose-950/30 rounded-xl p-4 space-y-2">
                <div className="flex justify-center items-end gap-1 h-6">
                  {[0.5, 0.9, 0.6, 1, 0.4, 0.8, 0.5].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-rose-500 to-purple-500 rounded-full animate-pulse"
                      style={{
                        height: `${h * 100}%`,
                        animationDelay: `${i * 100}ms`,
                        animationDuration: "700ms",
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs font-bold text-rose-850 dark:text-rose-300">{loadingStep}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inline presets */}
        {inputMode === "text" && (
          <div className="space-y-2 relative z-10 pt-2 border-t border-zinc-100 dark:border-zinc-900">
            <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block px-1">
              ⚡ 벤치마킹 샘플 텍스트 불러오기
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickPreset(
                  "돈 많은 부자들이 절대 사지 않는 3가지가 있습니다. 첫째는 명품 차, 둘째는 사치품, 셋째는 즉석 복권입니다. 부자는 감가상각이 높은 물건에는 절대로 내 돈을 태우지 않습니다.",
                  "자취생이 돈 아끼는 3대 생활 꿀팁"
                )}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 bg-zinc-50/50 hover:bg-zinc-100 dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-400 cursor-pointer transition-all active:scale-95"
              >
                자산관리 ➔ 자취꿀팁 리라이팅
              </button>
              <button
                onClick={() => handleQuickPreset(
                  "영어 공부 10년을 해도 스피킹 한마디 못하는 이유가 뭔지 아세요? 인풋만 하고 입 밖으로 꺼내는 아웃풋 훈련을 안 해서 그렇습니다. 딱 하루 10분만 쉐도잉 해보세요. 완전히 바뀝니다.",
                  "운동 가기 귀찮을 때 몸을 움직이게 만드는 멘탈 관리법"
                )}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 bg-zinc-50/50 hover:bg-zinc-100 dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-400 cursor-pointer transition-all active:scale-95"
              >
                영어회화 ➔ 헬스동기부여 리라이팅
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-500/30 dark:text-rose-350 rounded-xl p-4 text-xs"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Display Outputs */}
      <AnimatePresence>
        {/* Case A: Re-written adapter outputs */}
        {reverseResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 mb-8"
          >
            {/* Analysis card */}
            <div className="bg-gradient-to-r from-rose-500/10 to-indigo-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-5 sm:p-6 shadow-sm">
              <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mb-3">
                <Lightbulb className="w-4 h-4" />
                경쟁사 대본의 바이럴 공식 분석
              </h3>
              <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-350 leading-relaxed font-medium">
                {reverseResult.analysis}
              </p>
            </div>

            {/* Alternatives */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Alt 1: Spicy */}
              <div className="bg-white border border-rose-200 dark:bg-zinc-950/60 dark:border-rose-900/30 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
                  <span className="text-xs font-black text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-bounce" />
                    컨셉 1: 시선 강탈 매운맛 리라이팅
                  </span>
                </div>
                <div className="space-y-3.5 text-xs sm:text-sm">
                  <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-850">
                    <span className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1">Intro Hook (3초)</span>
                    <p className="font-extrabold text-zinc-850 dark:text-zinc-100">{reverseResult.alternative1.hook}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-850">
                    <span className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1">Body Pacing (본문)</span>
                    <p className="leading-relaxed text-zinc-700 dark:text-zinc-305 whitespace-pre-line">{reverseResult.alternative1.body}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-850">
                    <span className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1">Outro CTA (행동 유도)</span>
                    <p className="font-bold text-rose-600 dark:text-rose-455">{reverseResult.alternative1.cta}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleCopy("alt1", `${reverseResult.alternative1.hook}\n\n${reverseResult.alternative1.body}\n\n${reverseResult.alternative1.cta}`)}
                    className="p-1.5 px-3 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 flex items-center gap-1.5 text-xs font-bold transition-all"
                  >
                    {copiedKey === "alt1" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "alt1" ? "복사완료" : "대본 복사"}</span>
                  </button>
                </div>
              </div>

              {/* Alt 2: Mild */}
              <div className="bg-white border border-indigo-200 dark:bg-zinc-950/60 dark:border-indigo-900/30 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500 animate-pulse" />
                    컨셉 2: 신뢰 기반 유용한 정보형 리라이팅
                  </span>
                </div>
                <div className="space-y-3.5 text-xs sm:text-sm">
                  <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-850">
                    <span className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1">Intro Hook (3초)</span>
                    <p className="font-extrabold text-zinc-850 dark:text-zinc-100">{reverseResult.alternative2.hook}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-850">
                    <span className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1">Body Pacing (본문)</span>
                    <p className="leading-relaxed text-zinc-700 dark:text-zinc-305 whitespace-pre-line">{reverseResult.alternative2.body}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-850">
                    <span className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1">Outro CTA (행동 유도)</span>
                    <p className="font-bold text-indigo-600 dark:text-indigo-455">{reverseResult.alternative2.cta}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleCopy("alt2", `${reverseResult.alternative2.hook}\n\n${reverseResult.alternative2.body}\n\n${reverseResult.alternative2.cta}`)}
                    className="p-1.5 px-3 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 flex items-center gap-1.5 text-xs font-bold transition-all"
                  >
                    {copiedKey === "alt2" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "alt2" ? "복사완료" : "대본 복사"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Toolbox Saver buttons */}
            <div className="flex items-center gap-2.5 justify-end">
              <button
                onClick={handleSaveToToolbox}
                disabled={isSaving}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-105 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <FolderHeart className="w-3.5 h-3.5" />
                <span>{saveSuccess ? "보관 완료! ✓" : "내 보관함에 저장하기"}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Case B: Viral structure analysis outputs */}
        {viralResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 mb-8"
          >
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white border-b border-zinc-150 dark:border-zinc-900 pb-3 flex items-center gap-1">
                <Brain className="w-4 h-4 text-purple-500 animate-pulse" />
                AI 바이럴 구조 역설계 레포트
              </h3>
              
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-850">
                  <span className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    3초 시선 강탈 인트로 후킹 기법
                  </span>
                  <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">{viralResult.hook}</p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-850">
                  <span className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    시청 이탈 방지 전개(Body) 레이아웃
                  </span>
                  <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">{viralResult.body}</p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-850">
                  <span className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    행동 유도(CTA) 및 고정댓글 반응율 공식
                  </span>
                  <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">{viralResult.cta}</p>
                </div>

                {/* Ideas list */}
                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-850">
                  <span className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    내 채널 적용을 위한 기획 변형 아이디어 3
                  </span>
                  <ul className="space-y-2">
                    {viralResult.ideas.map((idea, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        <span className="text-[10px] font-black text-rose-500 shrink-0 mt-1">[{idx + 1}]</span>
                        <span>{idea}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

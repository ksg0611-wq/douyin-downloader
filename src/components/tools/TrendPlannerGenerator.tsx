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
  Zap,
  FolderHeart,
  Check,
  Info,
  Trash2,
  History,
  ArrowRight,
  TrendingUp,
  Globe,
  Compass
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sendGAEvent } from "@next/third-parties/google";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  deleteDoc, 
  doc 
} from "firebase/firestore";

interface TrendPlannerGeneratorProps {
  lang?: "ko" | "en";
}

interface ConceptPlan {
  title: string;
  hook: string;
  body: string;
}

interface TrendPlannerResultData {
  trendSummary: string;
  conceptA: ConceptPlan;
  conceptB: ConceptPlan;
  conceptC: ConceptPlan;
}

const PRESETS = [
  {
    label: "AI 스마트 에이전트",
    trendKeyword: "Gemini 2.5 Flash 출시 및 인공지능 에이전트 유행"
  },
  {
    label: "바이럴 댄스 챌린지",
    trendKeyword: "유튜브 쇼츠에서 떡상 중인 신작 댄스 챌린지 밈"
  }
];

export default function TrendPlannerGenerator({ lang = "ko" }: TrendPlannerGeneratorProps) {
  const [trendKeyword, setTrendKeyword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TrendPlannerResultData | null>(null);
  const [error, setError] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);

  // 1. Firestore real-time sync for trend planner history
  useEffect(() => {
    if (authLoading || !user || !user.uid || typeof user.uid !== 'string' || user.uid.trim() === "") {
      setHistoryList([]);
      return;
    }

    if (!db) return;

    setIsHistoryLoading(true);

    const q = query(
      collection(db, "trend_planner_history"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          list.push({
            id: docSnapshot.id,
            ...data,
          });
        });
        setHistoryList(list);
        setIsHistoryLoading(false);
      },
      (err) => {
        console.error("Firestore Sync Error (trend-planner):", err);
        setIsHistoryLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

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
        toolId: "trend-planner",
        toolName: "실시간 트렌드 탑승 기획기 (Trend-to-Shorts Planner)",
        inputData: {
          trendKeyword: trendKeyword.trim()
        },
        resultData: result,
        isFallback: isFallback,
        createdAt: serverTimestamp()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      alert("내 도구상자에 저장되었습니다!");
    } catch (err: any) {
      console.error("[TrendPlannerGenerator] Firestore 저장 실패:", err);
      if (err?.code === "permission-denied") {
        alert("저장 권한이 없습니다. 로그인 상태를 확인해 주세요.");
      } else {
        alert("저장에 실패했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async (targetKeyword?: string) => {
    const activeKeyword = (targetKeyword ?? trendKeyword).trim();
    if (!activeKeyword) {
      setError(
        lang === "ko" 
          ? "실시간 트렌드 키워드/사건을 입력해 주세요." 
          : "Please enter a real-time trend keyword or event."
      );
      return;
    }

    setIsLoading(true);
    sendGAEvent({ event: 'generate_click', value: 'trend_planner_generator' });
    setError("");
    setResult(null);
    setIsFallback(false);

    try {
      const response = await fetch("/api/trend-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trendKeyword: activeKeyword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "트렌드 분석 기획 중 오류가 발생했습니다.");
      }

      setResult(data.data);
      if (data.fallback === true) {
        setIsFallback(true);
      }
      if (targetKeyword) {
        setTrendKeyword(targetKeyword);
      }

      // 3. 성공 시 Firestore 'trend_planner_history' 컬렉션에 자동 저장
      if (db && user) {
        try {
          await addDoc(collection(db, "trend_planner_history"), {
            userId: user.uid,
            trendKeyword: activeKeyword,
            trendSummary: data.data.trendSummary,
            conceptA: data.data.conceptA,
            conceptB: data.data.conceptB,
            conceptC: data.data.conceptC,
            createdAt: serverTimestamp()
          });
        } catch (dbErr) {
          console.error("Failed to auto-save to trend_planner_history:", dbErr);
        }
      }
    } catch (err: any) {
      setError(err.message || "서버 통신 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadHistoryItem = (item: any) => {
    setTrendKeyword(item.trendKeyword || "");
    setResult({
      trendSummary: item.trendSummary || "",
      conceptA: item.conceptA || { title: "", hook: "", body: "" },
      conceptB: item.conceptB || { title: "", hook: "", body: "" },
      conceptC: item.conceptC || { title: "", hook: "", body: "" }
    });
    setIsFallback(false);
    setError("");
    setTimeout(() => {
      const el = document.getElementById("trend-planner-generator-container");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
  };

  const handleDeleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("정말 이 생성 내역을 삭제하시겠습니까?")) return;

    if (db) {
      try {
        await deleteDoc(doc(db, "trend_planner_history", id));
      } catch (err) {
        console.error("Failed to delete history item:", err);
        alert("삭제에 실패했습니다. 다시 시도해 주세요.");
      }
    }
  };

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      sendGAEvent({ event: 'copy_click', value: 'trend_planner_generator' });
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (e) {
      // safe bypass
    }
  };

  const handlePresetClick = (keyword: string) => {
    setTrendKeyword(keyword);
    handleGenerate(keyword);
  };

  return (
    <div id="trend-planner-generator-container" className="w-full max-w-4xl mx-auto">
      {/* 타이틀 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <TrendingUp className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            📊 트렌드 기획기 (Trend-to-Shorts Planner)
            <span className="bg-gradient-to-r from-indigo-500 to-rose-500 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              NEW
            </span>
          </h2>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-1">
            본 도구는 구글 실시간 검색 Grounding 기술을 기반으로 대중의 최신 관심사와 뉴스를 기획서로 자동 가공합니다. 트렌드 키워드를 입력하면 조회수를 터뜨릴 정보, 스킷, 논쟁 중심의 3가지 콘텐츠 시나리오를 즉시 설계하여 기획 속도를 단축합니다.
          </p>
        </div>
      </div>

      {/* 입력 패널 */}
      <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-5 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <label htmlFor="trend-keyword-input" className="block text-xs font-bold text-zinc-850 dark:text-zinc-300 uppercase tracking-wider px-1">
            🔍 바이럴 탑승을 원하는 실시간 트렌드 키워드 / 사건 / 밈 입력
          </label>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-xl opacity-10 group-focus-within:opacity-40 transition duration-300 blur-sm pointer-events-none" />
              <input
                id="trend-keyword-input"
                type="text"
                className="relative w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-400/60 transition-colors font-sans"
                placeholder={lang === "ko" ? "예시: Gemini 2.5 출시, 홈카페 요리 유행 챌린지, 최신 인공지능 트렌드" : "e.g., Gemini 2.5 Flash release, viral TikTok dance challenge"}
                value={trendKeyword}
                onChange={(e) => {
                  setTrendKeyword(e.target.value);
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
                  <span>검색 및 기획 중...</span>
                </>
              ) : (
                <>
                  <span>실시간 트렌드 기획 시작</span>
                  <span>⚡</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 퀵 추천 태그 */}
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block px-1">
            ⚡ 실시간 키워드 프리셋 테스트
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((item, index) => (
              <button
                key={index}
                onClick={() => handlePresetClick(item.trendKeyword)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 bg-zinc-50/50 hover:bg-zinc-100 hover:border-zinc-300 dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 cursor-pointer transition-all active:scale-95"
              >
                {item.label}
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
            <span>⚠️ 실시간 검색 API 할도를 초과하여 샘플 트렌드 기획안을 보여주고 있습니다.</span>
          </motion.div>
        )}
      </AnimatePresence>

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
          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-900 rounded-2xl p-5 space-y-4 animate-pulse">
              <div className="w-48 h-5 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="w-full h-10 bg-zinc-150 dark:bg-zinc-900 rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-900 rounded-2xl p-5 space-y-4 min-h-[220px]">
                  <div className="w-32 h-5 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="space-y-2">
                    <div className="w-full h-8 bg-zinc-150 dark:bg-zinc-900/60 rounded" />
                    <div className="w-full h-16 bg-zinc-150 dark:bg-zinc-900/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 결과 카드 렌더링 */}
        {!isLoading && result && (
          <div className="space-y-6">
            {/* 상단 툴박스 저장 바 */}
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

            {/* 1. 실시간 구글 검색 트렌드 요약 팩트체크 브리핑 */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 pb-2 border-b border-zinc-150 dark:border-zinc-850">
                <Globe className="w-4.5 h-4.5 animate-spin" style={{ animationDuration: '6s' }} />
                <h3 className="text-sm font-black flex items-center gap-1.5">
                  실시간 트렌드 요약 팩트체크 브리핑
                  <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase leading-none">
                    GOOGLE SEARCH
                  </span>
                </h3>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 font-bold leading-relaxed">
                {result.trendSummary}
              </p>
            </div>

            {/* 2. 3종 기획안 세트 가로/세로 그리드 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Concept A */}
              <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-2.5">
                    <span className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/40 flex items-center justify-center">
                      <Info className="w-4 h-4 text-rose-500" />
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400">
                      Concept A (정보 전달형)
                    </h3>
                  </div>

                  <div className="space-y-3 relative z-10 text-xs sm:text-sm">
                    <div>
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider block mb-0.5">Title</span>
                      <h4 className="font-extrabold text-zinc-900 dark:text-white leading-snug">
                        {result.conceptA.title}
                      </h4>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-200/40 dark:border-zinc-800/80">
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider block mb-0.5">3s Hook</span>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                        "{result.conceptA.hook}"
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider block mb-0.5">Body Script</span>
                      <p className="text-zinc-650 dark:text-zinc-350 leading-relaxed font-medium whitespace-pre-wrap text-xs sm:text-sm">
                        {result.conceptA.body}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
                  <button
                    onClick={() => handleCopy('conceptA', `${result.conceptA.title}\n\n[후킹]\n${result.conceptA.hook}\n\n[본문]\n${result.conceptA.body}`)}
                    className={`p-1.5 px-3 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      copiedKey === 'conceptA'
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                        : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-850 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-250"
                    }`}
                  >
                    {copiedKey === 'conceptA' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'conceptA' ? "복사됨" : "전체 복사"}</span>
                  </button>
                </div>
              </div>

              {/* Concept B */}
              <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-2.5">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-900/40 flex items-center justify-center">
                      <Flame className="w-4 h-4 text-indigo-500" />
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400">
                      Concept B (스킷/공감형)
                    </h3>
                  </div>

                  <div className="space-y-3 relative z-10 text-xs sm:text-sm">
                    <div>
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider block mb-0.5">Title</span>
                      <h4 className="font-extrabold text-zinc-900 dark:text-white leading-snug">
                        {result.conceptB.title}
                      </h4>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-200/40 dark:border-zinc-800/80">
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider block mb-0.5">3s Hook</span>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                        "{result.conceptB.hook}"
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider block mb-0.5">Body Script</span>
                      <p className="text-zinc-650 dark:text-zinc-350 leading-relaxed font-medium whitespace-pre-wrap text-xs sm:text-sm">
                        {result.conceptB.body}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
                  <button
                    onClick={() => handleCopy('conceptB', `${result.conceptB.title}\n\n[후킹]\n${result.conceptB.hook}\n\n[본문]\n${result.conceptB.body}`)}
                    className={`p-1.5 px-3 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      copiedKey === 'conceptB'
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                        : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-850 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-250"
                    }`}
                  >
                    {copiedKey === 'conceptB' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'conceptB' ? "복사됨" : "전체 복사"}</span>
                  </button>
                </div>
              </div>

              {/* Concept C */}
              <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-2.5">
                    <span className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">
                      Concept C (논쟁 유도형)
                    </h3>
                  </div>

                  <div className="space-y-3 relative z-10 text-xs sm:text-sm">
                    <div>
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider block mb-0.5">Title</span>
                      <h4 className="font-extrabold text-zinc-900 dark:text-white leading-snug">
                        {result.conceptC.title}
                      </h4>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-200/40 dark:border-zinc-800/80">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider block mb-0.5">3s Hook</span>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                        "{result.conceptC.hook}"
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider block mb-0.5">Body Script</span>
                      <p className="text-zinc-650 dark:text-zinc-350 leading-relaxed font-medium whitespace-pre-wrap text-xs sm:text-sm">
                        {result.conceptC.body}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
                  <button
                    onClick={() => handleCopy('conceptC', `${result.conceptC.title}\n\n[후킹]\n${result.conceptC.hook}\n\n[본문]\n${result.conceptC.body}`)}
                    className={`p-1.5 px-3 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      copiedKey === 'conceptC'
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                        : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-850 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-250"
                    }`}
                  >
                    {copiedKey === 'conceptC' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'conceptC' ? "복사됨" : "전체 복사"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 결과 비었을 때 안내 */}
        {!result && !isLoading && (
          <div className="bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-900 rounded-2xl p-8 text-center text-zinc-600 dark:text-zinc-400">
            <Compass className="w-8 h-8 mx-auto text-sky-500 mb-3 animate-bounce" />
            <p className="text-sm font-bold">탑승할 실시간 트렌드 키워드/사건을 입력해 주세요</p>
            <p className="text-xs mt-1">AI가 구글 실시간 검색 결과를 분석하여 화제 원인을 파악하고, 트렌드를 내 주제와 엮어 정보전달/스킷공감/논쟁유도 형태의 바이럴 기획서 3종을 즉시 출력합니다.</p>
          </div>
        )}
      </div>

      {/* 4. 최근 생성 내역 UI (Firestore 실시간 동기화) */}
      {user && (historyList.length > 0 || isHistoryLoading) && (
        <section className="mt-8 max-w-4xl mx-auto">
          <div className="bg-white border border-zinc-200 dark:bg-zinc-950/40 dark:border-zinc-900/80 rounded-2xl p-4 shadow-md relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-3.5 border-b border-zinc-200 dark:border-zinc-900 pb-2.5 relative z-10">
              <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" />
                🕒 최근 트렌드 기획 내역 (실시간)
              </h3>
            </div>

            {isHistoryLoading && historyList.length === 0 ? (
              <div className="flex items-center justify-center py-6 gap-2 text-xs text-zinc-500 dark:text-zinc-550 font-medium">
                <RefreshCcw className="w-4 h-4 animate-spin text-indigo-505" />
                <span>생성 기록을 가져오는 중...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 relative z-10">
                {historyList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleLoadHistoryItem(item)}
                    className="p-3 bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 hover:border-zinc-300 dark:bg-zinc-900/20 dark:hover:bg-zinc-900/60 dark:border-zinc-900 dark:hover:border-zinc-800 rounded-xl flex items-center justify-between gap-4 cursor-pointer group transition-all duration-200"
                  >
                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-sky-505 bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded">
                          트렌드 탑승
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500">
                          {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          }) : ""}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-850 dark:text-zinc-300 truncate mt-1 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                        키워드: {item.trendKeyword}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadHistoryItem(item);
                        }}
                        className="p-1 px-2.5 text-[10px] font-extrabold bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 border border-indigo-200 hover:border-indigo-600 dark:bg-zinc-950/80 dark:hover:bg-indigo-650 dark:hover:text-white dark:text-indigo-400 dark:border-indigo-500/30 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>불러오기</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                        className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:text-zinc-600 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                        title="기록 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <hr className="my-8 border-zinc-200 dark:border-zinc-800" />
      
      <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 space-y-4 leading-relaxed">
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">💡 트렌드 탑승 숏폼 기획의 파괴력</h4>
          <p>
            성공적인 바이럴 콘텐츠 생산을 위한 치트키는 현재 대중이 널리 인지하고 있거나 화제가 된 이슈(트렌드/사건/밈)의 물결에 편승하는 것입니다. 이 도구는 백엔드에서 네이티브 구글 검색 연동 기술을 결합하여 실시간으로 일어나는 화제의 정밀한 컨텍스트(맥락)를 실시간 분석해 냅니다. 이후 크리에이터의 고유 카테고리에 최적화된 3대 클래식 바이럴 형식(정보형, 스킷공감형, 댓글폭발 논쟁유도형)의 숏폼 기획서로 재배열해 줌으로써 누구나 쉽게 트렌드 물결에 탑승할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

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
  Trash2,
  History,
  ArrowRight,
  ShieldAlert,
  ArrowDownRight
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

interface ReverseEngineerGeneratorProps {
  lang?: "ko" | "en";
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

const PRESETS = [
  {
    label: "자산관리 vs 자취꿀팁",
    competitorScript: "돈 많은 사람들이 절대 안 사는 물건 3가지가 있습니다. 첫째, 비싼 수입차. 왜냐하면 감가상각이 심해서 자산 가치가 떨어지기 때문이죠. 둘째, 로또. 확률이 거의 없는 곳에 돈을 낭비하지 않습니다. 셋째, 남에게 보여주기 위한 명품. 진짜 부자는 내면을 채웁니다.",
    myTopic: "자취생이 돈 아끼는 생활 습관"
  },
  {
    label: "영어회화 vs 헬스등록",
    competitorScript: "영어 공부 10년을 해도 말 한마디 못하는 진짜 이유를 아시나요? 맨날 문법책만 보고 쓰기만 해서 그렇습니다. 진짜 영어가 늘려면 들리는 대로 입으로 소리 내서 따라 해야 합니다. 쉐도잉 하루 10분만 해보세요. 한 달 뒤에 귀와 입이 트입니다.",
    myTopic: "운동 초보가 헬스장 등록하고 안 가는 심리"
  }
];

export default function ReverseEngineerGenerator({ lang = "ko" }: ReverseEngineerGeneratorProps) {
  const [competitorScript, setCompetitorScript] = useState<string>("");
  const [myTopic, setMyTopic] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ReverseEngineerResultData | null>(null);
  const [error, setError] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);

  // 1. Firestore real-time sync for reverse-engineer history
  useEffect(() => {
    if (authLoading || !user) {
      setHistoryList([]);
      return;
    }

    if (!db) return;

    setIsHistoryLoading(true);

    const q = query(
      collection(db, "reverse_engineer_history"),
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
        console.error("Firestore Sync Error (reverse-engineer):", err);
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
        toolId: "reverse-engineer",
        toolName: "경쟁자 대본 역설계기 (Shorts Script Reverse Engineer)",
        inputData: {
          competitorScript: competitorScript.trim(),
          myTopic: myTopic.trim()
        },
        resultData: result,
        isFallback: isFallback,
        createdAt: serverTimestamp()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      alert("내 도구상자에 저장되었습니다!");
    } catch (err: any) {
      console.error("[ReverseEngineerGenerator] Firestore 저장 실패:", err);
      if (err?.code === "permission-denied") {
        alert("저장 권한이 없습니다. 로그인 상태를 확인해 주세요.");
      } else {
        alert("저장에 실패했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async (targetPreset?: { competitorScript: string; myTopic: string }) => {
    const activeScript = (targetPreset?.competitorScript ?? competitorScript).trim();
    const activeTopic = (targetPreset?.myTopic ?? myTopic).trim();

    if (!activeScript || !activeTopic) {
      setError(
        lang === "ko" 
          ? "경쟁사 대본과 내 채널 주제를 모두 입력해 주세요." 
          : "Please enter both the competitor's script and your channel topic."
      );
      return;
    }

    setIsLoading(true);
    sendGAEvent({ event: 'generate_click', value: 'reverse_engineer_generator' });
    setError("");
    setResult(null);
    setIsFallback(false);

    try {
      const response = await fetch("/api/reverse-engineer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          competitorScript: activeScript, 
          myTopic: activeTopic 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "AI 역설계 분석 중 오류가 발생했습니다.");
      }

      setResult(data.data);
      if (data.fallback === true) {
        setIsFallback(true);
      }
      if (targetPreset) {
        setCompetitorScript(targetPreset.competitorScript);
        setMyTopic(targetPreset.myTopic);
      }

      // 3. 성공 시 Firestore 'reverse_engineer_history' 컬렉션에 자동 저장
      if (db && user) {
        try {
          await addDoc(collection(db, "reverse_engineer_history"), {
            userId: user.uid,
            competitorScript: activeScript,
            myTopic: activeTopic,
            analysis: data.data.analysis,
            alternative1: data.data.alternative1,
            alternative2: data.data.alternative2,
            createdAt: serverTimestamp()
          });
        } catch (dbErr) {
          console.error("Failed to auto-save to reverse_engineer_history:", dbErr);
        }
      }
    } catch (err: any) {
      setError(err.message || "서버 통신 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadHistoryItem = (item: any) => {
    setCompetitorScript(item.competitorScript || "");
    setMyTopic(item.myTopic || "");
    setResult({
      analysis: item.analysis || "",
      alternative1: item.alternative1 || { hook: "", body: "", cta: "" },
      alternative2: item.alternative2 || { hook: "", body: "", cta: "" }
    });
    setIsFallback(false);
    setError("");
    setTimeout(() => {
      const el = document.getElementById("reverse-engineer-generator-container");
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
        await deleteDoc(doc(db, "reverse_engineer_history", id));
      } catch (err) {
        console.error("Failed to delete history item:", err);
        alert("삭제에 실패했습니다. 다시 시도해 주세요.");
      }
    }
  };

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      sendGAEvent({ event: 'copy_click', value: 'reverse_engineer_generator' });
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (e) {
      // safe bypass
    }
  };

  return (
    <div id="reverse-engineer-generator-container" className="w-full max-w-4xl mx-auto">
      {/* 타이틀 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Brain className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            🔬 경쟁자 대본 역설계기 (Shorts Script Reverse Engineer)
            <span className="bg-gradient-to-r from-indigo-500 to-rose-500 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              NEW
            </span>
          </h2>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-0.5">
            잘 터진 숏폼 대본을 해체 분석하여 흥행 공식을 밝히고, 내 채널에 최적화된 새로운 영상 대본 2종(매운맛/순한맛)으로 즉시 재조립합니다.
          </p>
        </div>
      </div>

      {/* 입력 패널 */}
      <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-5 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-4 relative z-10">
          {/* 경쟁사 대본 입력 */}
          <div className="space-y-1.5">
            <label htmlFor="competitor-script-input" className="block text-xs font-bold text-zinc-850 dark:text-zinc-300 uppercase tracking-wider px-1">
              📝 벤치마킹할 경쟁사 영상 대본 또는 내용 구성 입력
            </label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-xl opacity-10 group-focus-within:opacity-40 transition duration-300 blur-sm pointer-events-none" />
              <textarea
                id="competitor-script-input"
                rows={4}
                className="relative w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-400/60 transition-colors font-sans resize-none"
                placeholder={lang === "ko" ? "경쟁사의 잘 터진 숏폼 대본을 그대로 붙여넣거나, 영상의 구성 흐름을 적어주세요." : "Paste the competitor's viral script or video outline here."}
                value={competitorScript}
                onChange={(e) => {
                  setCompetitorScript(e.target.value);
                  if (error) setError("");
                }}
              />
            </div>
          </div>

          {/* 내 채널 주제 입력 */}
          <div className="space-y-1.5">
            <label htmlFor="my-topic-input" className="block text-xs font-bold text-zinc-850 dark:text-zinc-300 uppercase tracking-wider px-1">
              🎯 내 채널 주제 / 카테고리 입력
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-xl opacity-10 group-focus-within:opacity-40 transition duration-300 blur-sm pointer-events-none" />
                <input
                  id="my-topic-input"
                  type="text"
                  className="relative w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-400/60 transition-colors font-sans"
                  placeholder={lang === "ko" ? "예시: 초보 주식 투자, 20대 자취생 저축 팁, 홈 트레이닝 운동법" : "e.g., Budget meals for students, beginner home workout"}
                  value={myTopic}
                  onChange={(e) => {
                    setMyTopic(e.target.value);
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
                    <span>역설계 중...</span>
                  </>
                ) : (
                  <>
                    <span>역설계 분석 시작하기</span>
                    <span>⚡</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 퀵 추천 태그 */}
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block px-1">
            ⚡ 퀵 프리셋 테스트
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((item, index) => (
              <button
                key={index}
                onClick={() => handleGenerate(item)}
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
            <span>⚠️ 현재 AI 서버 요청이 폭주하여 저장된 샘플 데이터를 대치하여 출력 중입니다.</span>
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
        {/* 로딩 스켈레톤 */}
        {isLoading && (
          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-900 rounded-2xl p-5 space-y-4 animate-pulse">
              <div className="w-48 h-5 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="w-full h-12 bg-zinc-150 dark:bg-zinc-900 rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[1, 2].map((idx) => (
                <div key={idx} className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-900 rounded-2xl p-5 space-y-4 min-h-[280px]">
                  <div className="w-32 h-5 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="space-y-3">
                    <div className="w-full h-8 bg-zinc-150 dark:bg-zinc-900/60 rounded" />
                    <div className="w-full h-24 bg-zinc-150 dark:bg-zinc-900/60 rounded" />
                    <div className="w-full h-8 bg-zinc-150 dark:bg-zinc-900/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 결과 렌더링 */}
        {!isLoading && result && (
          <div className="space-y-6">
            {/* 상단 액션 바 */}
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

            {/* 흥행 공식 분석 요약 카드 */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 pb-2 border-b border-zinc-150 dark:border-zinc-850">
                <Sparkles className="w-4.5 h-4.5" />
                <h3 className="text-sm font-black">경쟁사 대본 흥행 공식 분석</h3>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 font-bold leading-relaxed">
                {result.analysis}
              </p>
            </div>

            {/* 두 가지 변형 대본 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 매운맛 대본 */}
              <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/40 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-rose-500" />
                  </span>
                  <h3 className="text-sm font-black text-rose-600 dark:text-rose-400">
                    🔥 변형 대본 1 (자극적/매운맛 컨셉)
                  </h3>
                </div>

                <div className="space-y-3.5 relative z-10 text-xs sm:text-sm">
                  {/* Hook */}
                  <div className="space-y-1 bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80">
                    <div className="flex justify-between items-center text-[10px] text-rose-500 font-bold mb-1">
                      <span>INTRO HOOK (3초)</span>
                      <button onClick={() => handleCopy('alt1-hook', result.alternative1.hook)} className="text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-0.5">
                        {copiedKey === 'alt1-hook' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>복사</span>
                      </button>
                    </div>
                    <p className="font-extrabold text-zinc-900 dark:text-zinc-100">"{result.alternative1.hook}"</p>
                  </div>

                  {/* Body */}
                  <div className="space-y-1 bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80">
                    <div className="flex justify-between items-center text-[10px] text-rose-500 font-bold mb-1">
                      <span>BODY CONTENT (본문)</span>
                      <button onClick={() => handleCopy('alt1-body', result.alternative1.body)} className="text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-0.5">
                        {copiedKey === 'alt1-body' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>복사</span>
                      </button>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 font-medium whitespace-pre-wrap leading-relaxed">
                      {result.alternative1.body}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="space-y-1 bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80">
                    <div className="flex justify-between items-center text-[10px] text-rose-500 font-bold mb-1">
                      <span>CTA OUTRO (참여 유도)</span>
                      <button onClick={() => handleCopy('alt1-cta', result.alternative1.cta)} className="text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-0.5">
                        {copiedKey === 'alt1-cta' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>복사</span>
                      </button>
                    </div>
                    <p className="font-extrabold text-zinc-800 dark:text-zinc-200">"{result.alternative1.cta}"</p>
                  </div>
                </div>
              </div>

              {/* 순한맛 대본 */}
              <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-900/40 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-indigo-500" />
                  </span>
                  <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    💡 변형 대본 2 (신뢰성/순한맛 컨셉)
                  </h3>
                </div>

                <div className="space-y-3.5 relative z-10 text-xs sm:text-sm">
                  {/* Hook */}
                  <div className="space-y-1 bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80">
                    <div className="flex justify-between items-center text-[10px] text-indigo-500 font-bold mb-1">
                      <span>INTRO HOOK (3초)</span>
                      <button onClick={() => handleCopy('alt2-hook', result.alternative2.hook)} className="text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-0.5">
                        {copiedKey === 'alt2-hook' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>복사</span>
                      </button>
                    </div>
                    <p className="font-extrabold text-zinc-900 dark:text-zinc-100">"{result.alternative2.hook}"</p>
                  </div>

                  {/* Body */}
                  <div className="space-y-1 bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80">
                    <div className="flex justify-between items-center text-[10px] text-indigo-500 font-bold mb-1">
                      <span>BODY CONTENT (본문)</span>
                      <button onClick={() => handleCopy('alt2-body', result.alternative2.body)} className="text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-0.5">
                        {copiedKey === 'alt2-body' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>복사</span>
                      </button>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 font-medium whitespace-pre-wrap leading-relaxed">
                      {result.alternative2.body}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="space-y-1 bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80">
                    <div className="flex justify-between items-center text-[10px] text-indigo-500 font-bold mb-1">
                      <span>CTA OUTRO (참여 유도)</span>
                      <button onClick={() => handleCopy('alt2-cta', result.alternative2.cta)} className="text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-0.5">
                        {copiedKey === 'alt2-cta' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>복사</span>
                      </button>
                    </div>
                    <p className="font-extrabold text-zinc-800 dark:text-zinc-200">"{result.alternative2.cta}"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 결과 비었을 때 안내 */}
        {!result && !isLoading && (
          <div className="bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-900 rounded-2xl p-8 text-center text-zinc-600 dark:text-zinc-400">
            <Brain className="w-8 h-8 mx-auto text-indigo-500 mb-3 animate-bounce" />
            <p className="text-sm font-bold">경쟁사 숏폼 대본과 내 채널 주제를 입력해 주세요</p>
            <p className="text-xs mt-1">잘 터진 대본의 흥행 공식 구조를 심리학적으로 해체 분석하여 내 채널에 최적화된 매운맛/순한맛 대본 2종으로 재구성해 드립니다.</p>
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
                🕒 최근 역설계 생성 내역 (실시간)
              </h3>
            </div>

            {isHistoryLoading && historyList.length === 0 ? (
              <div className="flex items-center justify-center py-6 gap-2 text-xs text-zinc-500 dark:text-zinc-550 font-medium">
                <RefreshCcw className="w-4 h-4 animate-spin text-indigo-505" />
                <span>생성 기록을 동기화하는 중...</span>
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
                        <span className="text-[10px] font-extrabold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                          역설계 대본
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
                        주제: {item.myTopic} (원본: {item.competitorScript?.substring(0, 30)}...)
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
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">💡 경쟁자 대본 역설계의 중요성</h4>
          <p>
            숏폼 알고리즘에서 가장 중요한 핵심 지표인 '시청 유지율(Retention)'을 극대화하기 위해선, 시장에서 이미 검증된 영상의 기획 구조를 철저히 벤치마킹하는 것이 가장 빠른 지름길입니다. 이 도구는 잘나가는 경쟁자의 후킹 구조, 문제 정의, 해결책 제시, 그리고 마지막 CTA까지 심리학적인 구성 원리를 해체 분석해 줍니다. 이후 원본의 튼튼한 '뼈대(구조)'만 유지한 채 내 채널 주제에 딱 들어맞는 완전히 새로운 오리지널 대본으로 자동 탈바꿈시켜 창작 시간을 극적으로 단축시킵니다.
          </p>
        </div>
      </div>
    </div>
  );
}

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
  Stethoscope
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

interface RetentionDoctorGeneratorProps {
  lang?: "ko" | "en";
}

interface RetentionDoctorResultData {
  hooks: string[];
  doctoredScript: string;
  doctorOpinion: string[];
}

const PRESETS = [
  {
    label: "테크 리뷰 (스마트 워치)",
    scriptDraft: "오늘 새로 산 스마트 워치 후기 올립니다. 디자인은 둥글게 생겨서 참 이쁘고요, 화면도 아주 선명하게 잘 나옵니다. 배터리 시간은 하루 반 정도 가는데 매일 충전해야 해서 좀 귀찮습니다. 기능 중에 헬스 케어 기능이 있어서 심박수나 산소포화도 측정이 되는데 참 신기하네요. 가격이 30만 원이라서 좀 비싼 감이 있지만 돈값은 하는 것 같습니다."
  },
  {
    label: "뷰티 정보 (기초 화장품)",
    scriptDraft: "여름철 피부 뒤집어졌을 때 쓰기 좋은 기초 제품 추천드립니다. 제가 한 달 동안 직접 써봤는데 끈적임이 전혀 없고 수분 충전이 잘 됩니다. 특히 여드름 붉은 기 진정시키는 데 효과를 많이 봤어요. 성분도 착해서 민감성 피부이신 분들도 안심하고 쓰실 수 있습니다. 올리브영에서 세일할 때 사면 1만 원대에 살 수 있으니까 꼭 쟁여두세요."
  }
];

export default function RetentionDoctorGenerator({ lang = "ko" }: RetentionDoctorGeneratorProps) {
  const [scriptDraft, setScriptDraft] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<RetentionDoctorResultData | null>(null);
  const [error, setError] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);

  // 1. Firestore real-time sync for retention doctor history
  useEffect(() => {
    if (authLoading || !user?.uid) {
      setHistoryList([]);
      return;
    }

    if (!db) return;

    setIsHistoryLoading(true);

    const q = query(
      collection(db, "retention_doctor_history"),
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
        console.error("Firestore Sync Error (retention-doctor):", err);
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
        toolId: "retention-doctor",
        toolName: "3초 후킹 & 이탈 방지 대본 닥터 (Retention Doctor)",
        inputData: {
          scriptDraft: scriptDraft.trim()
        },
        resultData: result,
        isFallback: isFallback,
        createdAt: serverTimestamp()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      alert("내 도구상자에 저장되었습니다!");
    } catch (err: any) {
      console.error("[RetentionDoctorGenerator] Firestore 저장 실패:", err);
      if (err?.code === "permission-denied") {
        alert("저장 권한이 없습니다. 로그인 상태를 확인해 주세요.");
      } else {
        alert("저장에 실패했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async (targetScript?: string) => {
    const activeScript = (targetScript ?? scriptDraft).trim();
    if (!activeScript) {
      setError(
        lang === "ko" 
          ? "심폐소생이 필요한 대본 초안을 입력해 주세요." 
          : "Please enter a script draft to diagnosis."
      );
      return;
    }

    setIsLoading(true);
    sendGAEvent({ event: 'generate_click', value: 'retention_doctor_generator' });
    setError("");
    setResult(null);
    setIsFallback(false);

    try {
      const response = await fetch("/api/retention-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scriptDraft: activeScript })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "대본 진단 중 오류가 발생했습니다.");
      }

      setResult(data.data);
      if (data.fallback === true) {
        setIsFallback(true);
      }
      if (targetScript) {
        setScriptDraft(targetScript);
      }

      // 3. 성공 시 Firestore 'retention_doctor_history' 컬렉션에 자동 저장
      if (db && user) {
        try {
          await addDoc(collection(db, "retention_doctor_history"), {
            userId: user.uid,
            scriptDraft: activeScript,
            hooks: data.data.hooks,
            doctoredScript: data.data.doctoredScript,
            doctorOpinion: data.data.doctorOpinion,
            createdAt: serverTimestamp()
          });
        } catch (dbErr) {
          console.error("Failed to auto-save to retention_doctor_history:", dbErr);
        }
      }
    } catch (err: any) {
      setError(err.message || "서버 통신 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadHistoryItem = (item: any) => {
    setScriptDraft(item.scriptDraft || "");
    setResult({
      hooks: item.hooks || [],
      doctoredScript: item.doctoredScript || "",
      doctorOpinion: item.doctorOpinion || []
    });
    setIsFallback(false);
    setError("");
    setTimeout(() => {
      const el = document.getElementById("retention-doctor-generator-container");
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
        await deleteDoc(doc(db, "retention_doctor_history", id));
      } catch (err) {
        console.error("Failed to delete history item:", err);
        alert("삭제에 실패했습니다. 다시 시도해 주세요.");
      }
    }
  };

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      sendGAEvent({ event: 'copy_click', value: 'retention_doctor_generator' });
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (e) {
      // safe bypass
    }
  };

  const handlePresetClick = (presetScript: string) => {
    setScriptDraft(presetScript);
    handleGenerate(presetScript);
  };

  // 대 brackets [...] 안의 지시어 파싱 및 강조
  const renderDoctoredScript = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\[[^\]]+\])/g);
    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span 
            key={index} 
            className="text-violet-600 dark:text-violet-400 font-extrabold bg-violet-50 dark:bg-violet-950/40 px-1.5 py-0.5 rounded mx-0.5 border border-violet-100 dark:border-violet-900/40 inline-block text-[11px] sm:text-xs my-0.5 tracking-tight font-mono select-none"
          >
            {part}
          </span>
        );
      }
      return <span key={index} className="text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">{part}</span>;
    });
  };

  return (
    <div id="retention-doctor-generator-container" className="w-full max-w-4xl mx-auto">
      {/* 타이틀 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Stethoscope className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            🩺 3초 후킹 & 이탈 방지 대본 닥터 (Retention Doctor)
            <span className="bg-gradient-to-r from-indigo-500 to-rose-500 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              NEW
            </span>
          </h2>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-0.5">
            밋밋한 대본 초안의 호흡을 진단하고, 3초 만에 스크롤을 붙잡는 치트키 후킹 멘트 및 이탈 방지용 초 단위 연출 처방을 내립니다.
          </p>
        </div>
      </div>

      {/* 입력 패널 */}
      <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-5 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <label htmlFor="script-draft-input" className="block text-xs font-bold text-zinc-850 dark:text-zinc-300 uppercase tracking-wider px-1">
            📝 심폐소생이 필요한 숏폼 대본 초안 입력
          </label>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-xl opacity-10 group-focus-within:opacity-40 transition duration-300 blur-sm pointer-events-none" />
            <textarea
              id="script-draft-input"
              rows={5}
              className="relative w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-400/60 transition-colors font-sans resize-none"
              placeholder={lang === "ko" ? "작성해 둔 거친 대본 초안이나 영상 기획 내용을 적어주세요. AI 닥터가 조회수를 폭발시킬 구조로 수술해 드립니다." : "Paste your rough script draft here."}
              value={scriptDraft}
              onChange={(e) => {
                setScriptDraft(e.target.value);
                if (error) setError("");
              }}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading}
              className={`py-3 px-6 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg ${
                isLoading
                  ? "bg-zinc-800 text-zinc-500 border border-zinc-700 pointer-events-none"
                  : "bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 hover:brightness-105 active:scale-95 shadow-indigo-500/10"
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin text-zinc-500" />
                  <span>대본 진단 중...</span>
                </>
              ) : (
                <>
                  <span>대본 심폐소생 시작하기</span>
                  <span>⚡</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 퀵 추천 태그 */}
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block px-1">
            ⚡ 실전 대본 샘플 테스트
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((item, index) => (
              <button
                key={index}
                onClick={() => handlePresetClick(item.scriptDraft)}
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
            <span>⚠️ 현재 AI 서버 요청이 집중되어 샘플 처방 내역을 대신 렌더링하고 있습니다.</span>
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
              <div className="space-y-2">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="w-full h-8 bg-zinc-150 dark:bg-zinc-900 rounded" />
                ))}
              </div>
            </div>
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-900 rounded-2xl p-5 space-y-4 animate-pulse min-h-[220px]">
              <div className="w-32 h-5 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="w-full h-28 bg-zinc-150 dark:bg-zinc-900 rounded" />
            </div>
          </div>
        )}

        {/* 결과 카드 렌더링 */}
        {!isLoading && result && (
          <div className="space-y-6">
            {/* 전체 저장 바 */}
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
                <span>{isSaving ? "저장 중..." : saveSuccess ? "도구상자 저장됨" : "도구상자에 전체 처방 결과 저장"}</span>
              </button>
            </div>

            {/* 1. 3초 후킹 치트키 리스트 */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-3">
                <span className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/40 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-rose-500" />
                </span>
                <h3 className="text-sm font-black text-rose-600 dark:text-rose-400">
                  🔥 3초 치트키 후킹 멘트 (3종 배너)
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {result.hooks.map((hookText, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/80 hover:border-rose-200 dark:hover:border-rose-950/60 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="text-[10px] font-black bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded shrink-0">
                        후킹 {index + 1}
                      </span>
                      <span className="text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 font-bold leading-relaxed line-clamp-2">
                        "{hookText}"
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(`hook-${index}`, hookText)}
                      className={`p-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                        copiedKey === `hook-${index}`
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                          : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-850 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-250"
                      }`}
                    >
                      {copiedKey === `hook-${index}` ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === `hook-${index}` ? "복사됨" : "복사"}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. 처방 대본 (지시어 하이라이트) */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200/50 dark:border-violet-900/40 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                  </span>
                  <h3 className="text-sm font-black text-violet-600 dark:text-violet-400">
                    🎬 닥터의 연출 처방 대본 (편집 지시어 가이드)
                  </h3>
                </div>
                <button
                  onClick={() => handleCopy('doctored-script', result.doctoredScript)}
                  className={`p-1.5 px-3 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    copiedKey === 'doctored-script'
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                      : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-850 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-250"
                  }`}
                >
                  {copiedKey === 'doctored-script' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>전체 대본 복사</span>
                </button>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/45 border border-zinc-200/50 dark:border-zinc-800/80 max-h-[300px] overflow-y-auto">
                <div className="text-sm tracking-wide leading-relaxed break-keep whitespace-pre-wrap">
                  {renderDoctoredScript(result.doctoredScript)}
                </div>
              </div>
            </div>

            {/* 3. 진단 조언 피드백 */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-3">
                <span className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                </span>
                <h3 className="text-sm font-black text-amber-600 dark:text-amber-400">
                  💡 디렉터 최종 진단 및 촬영/편집 핵심 조언
                </h3>
              </div>

              <div className="space-y-2">
                {result.doctorOpinion.map((opinion, idx) => (
                  <div 
                    key={idx}
                    className="flex gap-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/40 dark:border-zinc-900/80 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-bold"
                  >
                    <span className="text-indigo-500 shrink-0">✔</span>
                    <span>{opinion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 결과 비었을 때 안내 */}
        {!result && !isLoading && (
          <div className="bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-900 rounded-2xl p-8 text-center text-zinc-600 dark:text-zinc-400">
            <Stethoscope className="w-8 h-8 mx-auto text-violet-500 mb-3 animate-bounce" />
            <p className="text-sm font-bold">심폐소생할 숏폼 대본 초안을 입력해 주세요</p>
            <p className="text-xs mt-1">대본 흐름의 이탈 유발 구간을 도려내고, 시청률 유지에 효과적인 시각 자막 및 음향 연출 장치들을 대본 프레임 마디마디마다 정밀하게 처방해 드립니다.</p>
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
                🕒 최근 대본 처방 내역 (실시간)
              </h3>
            </div>

            {isHistoryLoading && historyList.length === 0 ? (
              <div className="flex items-center justify-center py-6 gap-2 text-xs text-zinc-500 dark:text-zinc-550 font-medium">
                <RefreshCcw className="w-4 h-4 animate-spin text-indigo-505" />
                <span>기록을 가져오는 중...</span>
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
                        <span className="text-[10px] font-extrabold text-violet-500 bg-violet-50 dark:bg-violet-950/40 px-1.5 py-0.5 rounded">
                          대본 닥터
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
                        초안: {item.scriptDraft?.substring(0, 50)}...
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
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">💡 3초 후킹 & 대본 닥터의 효과</h4>
          <p>
            숏폼 알고리즘 노출의 최우선 조건은 **평균 시청 지속 시간**입니다. 대다수의 일반적인 동영상 대본은 도입부 3초가 밋밋하거나 설명조로 일관하여 유저의 조기 이탈을 가속화합니다. 이 대본 닥터는 기존 초안을 심리학적으로 다듬어 강한 후킹 3종 세트를 제안할 뿐만 아니라, 유저가 지루함을 느끼지 않도록 자막 효과, 화면 크기(배율) 조정, 음향 삽입 타이밍을 초 단위 가이드라인으로 배치해 줍니다. 연출 처방만 준수하여 편집해도 채널의 평균 시청 시간 수치를 극적으로 상승시킬 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

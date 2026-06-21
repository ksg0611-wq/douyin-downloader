"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  RefreshCcw, 
  AlertCircle, 
  ChevronRight,
  Flame,
  Lightbulb,
  FileText,
  FolderHeart,
  Check,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sendGAEvent } from "@next/third-parties/google";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface HookGeneratorProps {
  lang?: "ko" | "en";
}

interface HookData {
  fact: string;
  empathy: string;
  question: string;
}

const QUICK_TOPICS = [
  "다이어트 식단",
  "직장인 재테크",
  "인스타 떡상법",
  "유튜브 알고리즘",
  "퇴사 고민",
  "반려견 훈련",
  "초간단 요리",
  "스마트폰 꿀팁"
];

export default function HookGenerator({ lang = "ko" }: HookGeneratorProps) {
  const [topic, setTopic] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<HookData | null>(null);
  const [error, setError] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const { user, signInWithGoogle } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ─── Firestore 도구상자 저장 ────────────────────────────────────────────────────
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
        toolId: "hook-generator",
        toolName: "AI 3초 후킹(Hook) 대본 생성기",
        inputData: {
          topic: topic.trim()
        },
        resultData: result,
        isFallback: isFallback,
        createdAt: serverTimestamp()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      alert("내 도구상자에 저장되었습니다!");
    } catch (err: any) {
      console.error("[HookGenerator] Firestore 저장 실패:", err);
      // Firestore 권한 에러 안내
      if (err?.code === "permission-denied") {
        alert("저장 권한이 없습니다. 로그인 상태를 확인해 주세요.");
      } else {
        alert("저장에 실패했습니다. 다시 시도해 주세요.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // ─── 대본 생성 ─────────────────────────────────────────────────────────────────
  const handleGenerate = async (targetTopic?: string) => {
    const activeTopic = (targetTopic ?? topic).trim();
    if (!activeTopic) {
      setError(lang === "ko" ? "영상 주제를 입력해 주세요." : "Please enter a video topic.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);
    setIsFallback(false);
    sendGAEvent({ event: 'generate_click', value: 'hook_generator' });

    try {
      const response = await fetch("/api/generate-hook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: activeTopic })
      });

      const data = await response.json();

      // 429 상태코드를 프론트에서 정확히 인지하여 에러 문구 표시
      if (!response.ok) {
        const errMsg = data.error?.message || "AI 생성 중 오류가 발생했습니다.";
        throw new Error(errMsg);
      }

      setResult(data.data);
      // Fallback 모드 여부 감지 (배너 표시용)
      if (data.fallback === true) {
        setIsFallback(true);
      }

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
      sendGAEvent({ event: 'copy_click', value: 'hook_generator' });
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (e) {
      // safe bypass
    }
  };

  const handleQuickClick = (item: string) => {
    setTopic(item);
    handleGenerate(item);
  };

  return (
    <div id="hook-generator-container" className="w-full max-w-4xl mx-auto">
      {/* 타이틀 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            🪄 AI 3초 후킹(Hook) 대본 생성기
            <span className="bg-gradient-to-r from-cyan-400 to-rose-500 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              AI
            </span>
          </h2>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-0.5">
            제작하려는 영상의 주제만 입력하면, 시청자의 시선을 3초 안에 사로잡을 3대 마케팅 스타일의 도입부 대본을 자동 생성합니다.
          </p>
        </div>
      </div>

      {/* 입력 패널 */}
      <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-5 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <label htmlFor="topic-input" className="block text-xs font-bold text-zinc-850 dark:text-zinc-300 uppercase tracking-wider px-1">
            🎯 영상의 핵심 주제 입력
          </label>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-xl opacity-10 group-focus-within:opacity-40 transition duration-300 blur-sm pointer-events-none" />
              <input
                id="topic-input"
                type="text"
                className="relative w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-400/60 transition-colors font-sans"
                placeholder={lang === "ko" ? "예: 바쁜 현대인을 위한 간단한 아침 운동, 소액 부동산 투자법" : "e.g., Easy morning workout for busy people"}
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
                  <span>생성 중...</span>
                </>
              ) : (
                <>
                  <span>대본 생성하기</span>
                  <span>🪄</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 퀵 프리셋 키워드 */}
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block px-1">
            ⚡ 추천 인기 주제 퀵 테스트
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_TOPICS.map((item) => (
              <button
                key={item}
                onClick={() => handleQuickClick(item)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 bg-zinc-50/50 hover:bg-zinc-100 hover:border-zinc-300 dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 cursor-pointer transition-all active:scale-95"
              >
                {item}
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
            <span>⚠️ 현재 AI 서버 요청이 집중되어 샘플 대본을 표시하고 있습니다. 잠시 후 다시 생성해 보세요!</span>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* 결과 구역 */}
      <div className="space-y-4">
        {/* 로딩용 카드 스켈레톤 */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-900 rounded-2xl p-5 space-y-4 animate-pulse min-h-[180px] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-16 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  <div className="w-full h-8 bg-zinc-150 dark:bg-zinc-900 rounded" />
                </div>
                <div className="w-20 h-7 bg-zinc-200 dark:bg-zinc-800 rounded self-end" />
              </div>
            ))}
          </div>
        )}

        {/* 결과 카드 렌더링 */}
        {!isLoading && result && (
          <div className="space-y-4">
            {/* 도구상자 저장 버튼 */}
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
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <FolderHeart className="w-4 h-4 text-rose-500" />
                )}
                <span>{isSaving ? "저장 중..." : saveSuccess ? "도구상자 저장됨" : "도구상자에 전체 결과 저장"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
              {/* 1. 팩트 폭행 카드 */}
              <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[190px] relative overflow-hidden group">
                <div className="space-y-3 relative z-10">
                  <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-200/50 dark:bg-indigo-950/20 dark:border-indigo-900/60 dark:text-indigo-400 px-2 py-0.5 rounded">
                    도발적인 팩트 폭행 💥
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-bold">
                    "{result.fact}"
                  </p>
                </div>
                <div className="mt-4 flex justify-end relative z-10">
                  <button
                    onClick={() => handleCopy("fact", result.fact)}
                    className={`py-1.5 px-3 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      copiedKey === "fact"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                        : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    {copiedKey === "fact" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "fact" ? "복사 완료" : "복사하기"}</span>
                  </button>
                </div>
              </div>

              {/* 2. 감성적인 공감 카드 */}
              <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[190px] relative overflow-hidden group">
                <div className="space-y-3 relative z-10">
                  <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 border border-rose-200/50 dark:bg-rose-950/20 dark:border-rose-900/60 dark:text-rose-400 px-2 py-0.5 rounded">
                    감성적인 공감 유도 💌
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-bold">
                    "{result.empathy}"
                  </p>
                </div>
                <div className="mt-4 flex justify-end relative z-10">
                  <button
                    onClick={() => handleCopy("empathy", result.empathy)}
                    className={`py-1.5 px-3 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      copiedKey === "empathy"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                        : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    {copiedKey === "empathy" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "empathy" ? "복사 완료" : "복사하기"}</span>
                  </button>
                </div>
              </div>

              {/* 3. 호기심 질문 카드 */}
              <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[190px] relative overflow-hidden group">
                <div className="space-y-3 relative z-10">
                  <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 border border-amber-200/50 dark:bg-amber-950/20 dark:border-amber-900/60 dark:text-amber-400 px-2 py-0.5 rounded">
                    호기심 극대화 질문 ❓
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-bold">
                    "{result.question}"
                  </p>
                </div>
                <div className="mt-4 flex justify-end relative z-10">
                  <button
                    onClick={() => handleCopy("question", result.question)}
                    className={`py-1.5 px-3 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      copiedKey === "question"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                        : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    {copiedKey === "question" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "question" ? "복사 완료" : "복사하기"}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 빈 결과 상태 */}
        {!result && !isLoading && (
          <div className="bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-900 rounded-2xl p-8 text-center text-zinc-600 dark:text-zinc-400">
            <Lightbulb className="w-8 h-8 mx-auto text-yellow-500 mb-3 animate-bounce" />
            <p className="text-sm font-bold">영상의 대략적인 주제를 위에 입력해 주세요</p>
            <p className="text-xs mt-1">SaaS 인트로 알고리즘이 바이럴 확률이 가장 높은 3초 대본 도입부 3가지를 생성합니다.</p>
          </div>
        )}
      </div>

      <hr className="my-8 border-zinc-200 dark:border-zinc-800" />
      
      <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 space-y-4 leading-relaxed">
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">💡 AI 3초 후킹 대본 생성기의 필요성</h4>
          <p>
            숏폼 영상(틱톡, 유튜브 쇼츠, 인스타그램 릴스)은 첫 3초 안에 시청자의 시선을 붙잡지 못하면 대부분의 오디언스가 즉시 스와이프하여 스킵(이탈)해 버립니다. 플랫폼 알고리즘 또한 비디오 초반의 이탈률을 기반으로 해당 영상의 가치를 평가하기 때문에, 첫 3초의 도입부 멘트(Hook)가 전체 노출 성과를 좌우한다고 해도 과언이 아닙니다. 이 AI 3초 후킹 대본 생성기는 시청 심리학에 근거한 세 가지 마케팅 스타일(도발적인 팩트 폭행, 감성적인 공감 유도, 호기심 극대화 질문)에 맞추어 시청자의 손가락을 멈추게 만들 강력한 첫 문장 스크립트를 즉시 생성하여 제공합니다.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">📖 100% 활용 가이드</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>1단계 (주제 입력):</strong> 내가 제작하고자 하는 숏폼 비디오의 핵심 주제나 해결하고 싶은 유저의 고민을 입력창에 명확히 작성합니다.</li>
            <li><strong>2단계 (스타일 선택 및 복사):</strong> '대본 생성하기' 버튼을 누르면 연산된 3가지 후킹 대본 카드 중 영상의 기획 의도와 연출 방식에 가장 부합하는 문구를 선택해 복사합니다.</li>
            <li><strong>3단계 (프로덕션 적용):</strong> 복사한 텍스트를 영상의 첫 3초 자막으로 크게 노출하고, 동시에 AI 내레이션이나 직접 보이스오버로 또렷하게 들려주어 시청 지속을 극대화합니다.</li>
          </ol>
        </div>
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">🔥 크리에이터 실전 꿀팁</h4>
          <p>
            후킹 멘트는 단지 오디오로만 흘려보내는 것보다, 화면 정중앙이나 상단 안전 영역 내에 눈에 띄는 폰트와 원색 계열의 배경 박스를 조합하여 텍스트 자막으로 강력하게 동시에 뿌려주는 것이 효과적입니다. 예를 들어 '도발적인 팩트 폭행' 스타일의 후킹을 사용할 경우, 시청자가 미처 자막을 읽기도 전에 뇌리에 충격을 주는 이미지나 효과음을 배치하여 몰입을 유도하십시오.
          </p>
        </div>
      </div>

    </div>
  );
}

"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  RefreshCcw, 
  AlertCircle, 
  Lightbulb, 
  Globe,
  Clock,
  Zap,
  Info,
  FolderHeart,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sendGAEvent } from "@next/third-parties/google";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface UploadTimeCalculatorProps {
  lang?: "ko" | "en";
}

interface CalculatedTimeData {
  targetLocalTime: string;
  koreanTime: string;
  reason: string;
}

const COUNTRIES = [
  { value: "미국", label: "🇺🇸 미국 (북미)" },
  { value: "중국", label: "🇨🇳 중국" },
  { value: "일본", label: "🇯🇵 일본" },
  { value: "동남아", label: "🌏 동남아 (태국/베트남/인도네시아)" },
  { value: "유럽", label: "🇪🇺 유럽 (영국/독일/프랑스)" },
  { value: "남미", label: "🇧🇷 남미 (브라질/멕시코)" }
];

const PLATFORMS = [
  { value: "틱톡", label: "🎵 틱톡 (TikTok)" },
  { value: "도우인", label: "🇨🇳 도우인 (Douyin)" },
  { value: "유튜브 쇼츠", label: "🔴 유튜브 쇼츠 (YouTube Shorts)" },
  { value: "인스타그램 릴스", label: "📸 인스타그램 릴스 (Instagram Reels)" },
  { value: "샤오홍슈", label: "📕 샤오홍슈 (Xiaohongshu)" }
];

export default function UploadTimeCalculator({ lang = "ko" }: UploadTimeCalculatorProps) {
  const [country, setCountry] = useState<string>("미국");
  const [platform, setPlatform] = useState<string>("틱톡");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CalculatedTimeData | null>(null);
  const [error, setError] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { user, signInWithGoogle } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveToToolbox = async () => {
    if (!result) return;
    if (!user) {
      alert("로그인 후 이용할 수 있는 기능입니다.");
      try {
        await signInWithGoogle();
      } catch (err) {
        console.error(err);
      }
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(db, "users", user.uid, "history"), {
        toolId: "upload-time-calculator",
        toolName: "글로벌 최적 업로드 타임 계산기",
        inputData: {
          country,
          platform
        },
        resultData: result,
        createdAt: serverTimestamp()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      alert("내 도구상자에 저장되었습니다!");
    } catch (err) {
      console.error(err);
      alert("저장에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCalculate = async () => {
    setIsLoading(true);
    sendGAEvent({ event: 'generate_click', value: 'upload_time_calculator' });
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/calculate-upload-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, platform })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "AI 시간 연산 중 오류가 발생했습니다.");
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message || "서버 통신 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      sendGAEvent({ event: 'copy_click', value: 'upload_time_calculator' });
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (e) {
      // safe bypass
    }
  };

  return (
    <div id="upload-time-calculator-container" className="w-full max-w-4xl mx-auto">
      {/* 타이틀 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-rose-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Globe className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            🌍 글로벌 크로스보더 최적 업로드 타임 계산기
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              NEW
            </span>
          </h2>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-0.5">
            타겟 국가와 플랫폼의 트래픽 피크 타임 및 시차를 분석하여, 한국 시간(KST) 기준 최적의 예약 업로드 시점을 계산해 줍니다.
          </p>
        </div>
      </div>

      {/* 입력 패널 */}
      <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-5 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          {/* 타겟 국가 선택 */}
          <div className="space-y-2">
            <label htmlFor="country-select" className="block text-xs font-bold text-zinc-850 dark:text-zinc-300 uppercase tracking-wider px-1">
              📍 타겟 국가 선택
            </label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-10 group-focus-within:opacity-40 transition duration-300 blur-sm pointer-events-none" />
              <select
                id="country-select"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="relative w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-400/60 transition-colors font-sans cursor-pointer appearance-none"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value} className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-500">
                ▼
              </div>
            </div>
          </div>

          {/* 타겟 플랫폼 선택 */}
          <div className="space-y-2">
            <label htmlFor="platform-select" className="block text-xs font-bold text-zinc-850 dark:text-zinc-300 uppercase tracking-wider px-1">
              📱 타겟 플랫폼 선택
            </label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-10 group-focus-within:opacity-40 transition duration-300 blur-sm pointer-events-none" />
              <select
                id="platform-select"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="relative w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-400/60 transition-colors font-sans cursor-pointer appearance-none"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value} className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
                    {p.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-500">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* 연산 실행 버튼 */}
        <div className="flex justify-end relative z-10 pt-2">
          <button
            onClick={handleCalculate}
            disabled={isLoading}
            className={`py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg w-full sm:w-auto ${
              isLoading
                ? "bg-zinc-800 text-zinc-500 border border-zinc-700 pointer-events-none"
                : "bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-500 hover:brightness-105 active:scale-95 shadow-blue-500/10"
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCcw className="w-4 h-4 animate-spin text-zinc-500" />
                <span>글로벌 골든아워 계산 중...</span>
              </>
            ) : (
              <>
                <span>최적 업로드 시간 계산하기</span>
                <span>⏰</span>
              </>
            )}
          </button>
        </div>
      </div>

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
        {/* 로딩용 카드 스켈레톤 */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-900 rounded-2xl p-5 space-y-4 animate-pulse min-h-[160px] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. 현지 골든 아워 */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[180px] relative overflow-hidden group">
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/40 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-500" />
                  </span>
                  <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                    현지 타겟 골든 아워 ⏰
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-850 dark:text-zinc-250 leading-relaxed font-black">
                  {result.targetLocalTime}
                </p>
              </div>
              <div className="mt-4 flex justify-end relative z-10">
                <button
                  onClick={() => handleCopy("local", result.targetLocalTime)}
                  className={`py-1.5 px-3 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    copiedKey === "local"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                      : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  {copiedKey === "local" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "local" ? "복사 완료" : "시간 복사"}</span>
                </button>
              </div>
            </div>

            {/* 2. 한국 예약 업로드 타임 */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[180px] relative overflow-hidden group">
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-900/40 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-indigo-500" />
                  </span>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                    한국 기준(KST) 예약 추천 시간 🇰🇷
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-850 dark:text-zinc-250 leading-relaxed font-black">
                  {result.koreanTime}
                </p>
              </div>
              <div className="mt-4 flex justify-end relative z-10">
                <button
                  onClick={() => handleCopy("kst", result.koreanTime)}
                  className={`py-1.5 px-3 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    copiedKey === "kst"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                      : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  {copiedKey === "kst" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "kst" ? "복사 완료" : "시간 복사"}</span>
                </button>
              </div>
            </div>

            {/* 3. 추천 근거 및 분석 */}
            <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[180px] relative overflow-hidden group">
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/40 flex items-center justify-center">
                    <Info className="w-4 h-4 text-rose-500" />
                  </span>
                  <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                    트래픽 및 요일 집중 추천 이유 💡
                  </span>
                </div>
                <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                  {result.reason}
                </p>
              </div>
              <div className="mt-4 flex justify-end relative z-10">
                <button
                  onClick={() => handleCopy("reason", result.reason)}
                  className={`py-1.5 px-3 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    copiedKey === "reason"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                      : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  {copiedKey === "reason" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "reason" ? "복사 완료" : "근거 복사"}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

        {/* 결과 없을 때 안내 */}
        {!result && !isLoading && (
          <div className="bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-900 rounded-2xl p-8 text-center text-zinc-600 dark:text-zinc-400">
            <Lightbulb className="w-8 h-8 mx-auto text-yellow-500 mb-3 animate-bounce" />
            <p className="text-sm font-bold">진출하려는 타겟 국가와 플랫폼을 선택해 주세요</p>
            <p className="text-xs mt-1">해외 트래픽 집중 골든 아워와 대한민국 예약 전송 최적 시간 및 추천 사유를 연산합니다.</p>
          </div>
        )}
      </div>

      <hr className="my-8 border-zinc-200 dark:border-zinc-800" />
      
      <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 space-y-4 leading-relaxed">
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">💡 글로벌 크로스보더 최적 업로드 타임 계산기의 필요성</h4>
          <p>
            글로벌 숏폼 시장은 각 국가별 시차와 통근/여가 시간 등의 라이프사이클에 따라 트래픽이 몰리는 시간대(골든 아워)가 완전히 다릅니다. 국내에서 제작한 영상을 해외 타겟 플랫폼에 무작정 한국 시각에 업로드하면 초반 트래픽 획득에 크게 불리해집니다. 이 도구는 타겟하려는 해외 국가의 모바일 사용 피크 타임을 인공지능이 계산하여 한국 시간(KST) 예약 업로드 최적 시점으로 환산해 줍니다.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">📖 100% 활용 가이드</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>1단계 (선택):</strong> 진입하고자 하는 목표 해외 타겟 국가와 해당 국가에서 주력으로 활용할 숏폼 플랫폼을 선택합니다.</li>
            <li><strong>2단계 (시간 산출):</strong> '최적 업로드 시간 계산하기' 버튼을 눌러 피크 분석 스케줄을 조회합니다.</li>
            <li><strong>3단계 (예약 발행):</strong> 산출된 한국 시간(KST)을 바탕으로 플랫폼 관리자 페이지에서 예약 업로드(Schedule Upload)를 설정하여 발행합니다.</li>
          </ol>
        </div>
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">🔥 크리에이터 실전 꿀팁</h4>
          <p>
            추천된 예약 업로드 시간보다 30분~1시간 전에 미리 업로드를 예약하는 것이 시스템 파이프라인 상 안전합니다. 숏폼 플랫폼의 인공지능 알고리즘이 비디오 화질 인코딩 및 유해성 검사를 거쳐 유저 피드에 노출시키기까지 평균 20~40분의 렌더링 검사 대기 시간이 발생하기 때문입니다. 또한, 타겟 국가의 공휴일이나 연휴 시즌에는 주말 트래픽 패턴이 적용되므로 계절성과 트렌드 이벤트를 함께 고려해 스케줄링해야 효과적입니다.
          </p>
        </div>
      </div>

    </div>
  );
}

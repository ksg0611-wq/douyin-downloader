"use client";

import React, { useState } from "react";
import { 
  Mail, 
  Copy, 
  CheckCircle2, 
  RefreshCcw, 
  AlertCircle, 
  Info,
  Send,
  Sparkles,
  FileText,
  FolderHeart,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sendGAEvent } from "@next/third-parties/google";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface SponsorPitchGeneratorProps {
  lang?: "ko" | "en";
}

interface PitchResult {
  subject: string;
  greeting: string;
  channelAppeal: string;
  synergy: string;
  concept: string;
  closing: string;
}

const PRESETS = [
  {
    topic: "홈카페 & 커피 레시피 ☕",
    audience: "2030 직장인 여성 및 커피 매니아",
    brand: "네스프레소 (Nespresso)"
  },
  {
    topic: "자취생 간편 요리 및 홈쿡 🍳",
    audience: "1인 가구 및 가성비를 중시하는 대학생",
    brand: "쿠팡이츠 (Coupang Eats)"
  },
  {
    topic: "테크 리뷰 및 가성비 가전 추천 💻",
    audience: "전자기기와 IT 제품에 관심이 많은 2040 남성",
    brand: "로지텍 (Logitech)"
  },
  {
    topic: "미니멀리스트 룸투어 및 인테리어 🏠",
    audience: "감성 인테리어와 공간 연출을 좋아하는 신혼부부 및 2030",
    brand: "오늘의집 (Bucketplace)"
  }
];

export default function SponsorPitchGenerator({ lang = "ko" }: SponsorPitchGeneratorProps) {
  const [channelTopic, setChannelTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [targetBrand, setTargetBrand] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PitchResult | null>(null);
  const [error, setError] = useState("");
  const [copiedAll, setCopiedAll] = useState(false);
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
        toolId: "sponsor-pitch-generator",
        toolName: "브랜드 협찬(광고) 제안서 자동 생성기",
        inputData: {
          channelTopic: channelTopic.trim(),
          targetAudience: targetAudience.trim(),
          targetBrand: targetBrand.trim(),
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

  const handleGenerate = async (presetData?: typeof PRESETS[number]) => {
    const topicVal = presetData ? presetData.topic : channelTopic.trim();
    const audienceVal = presetData ? presetData.audience : targetAudience.trim();
    const brandVal = presetData ? presetData.brand : targetBrand.trim();

    if (!topicVal || !audienceVal || !brandVal) {
      setError(
        lang === "ko" 
          ? "모든 입력 필드(채널 주제, 시청자층, 타겟 브랜드)를 작성해 주세요." 
          : "Please fill out all input fields (Channel Topic, Target Audience, Target Brand)."
      );
      return;
    }

    setIsLoading(true);
    sendGAEvent({ event: 'generate_click', value: 'sponsor_pitch_generator' });
    setError("");
    setResult(null);
    setCopiedAll(false);

    try {
      const response = await fetch("/api/generate-sponsor-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelTopic: topicVal,
          targetAudience: audienceVal,
          targetBrand: brandVal
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "AI 제안서 생성 중 오류가 발생했습니다.");
      }

      setResult(data.data);
      if (presetData) {
        setChannelTopic(presetData.topic);
        setTargetAudience(presetData.audience);
        setTargetBrand(presetData.brand);
      }
    } catch (err: any) {
      setError(err.message || "서버 통신 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      sendGAEvent({ event: 'copy_click', value: 'sponsor_pitch_generator' });
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (e) {
      // safe bypass
    }
  };

  const handleCopyAll = async () => {
    if (!result) return;
    const fullText = `[이메일 제목]\n${result.subject}\n\n[인사말]\n${result.greeting}\n\n[채널 어필 포인트]\n${result.channelAppeal}\n\n[브랜드 시너지]\n${result.synergy}\n\n[숏폼 기획안]\n${result.concept}\n\n[마무리]\n${result.closing}`;
    try {
      await navigator.clipboard.writeText(fullText);
      sendGAEvent({ event: 'copy_click', value: 'sponsor_pitch_generator' });
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      // safe bypass
    }
  };

  const handlePresetClick = (preset: typeof PRESETS[number]) => {
    handleGenerate(preset);
  };

  return (
    <div id="sponsor-pitch-generator-container" className="w-full max-w-4xl mx-auto">
      {/* 타이틀 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
          <Mail className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            💰 브랜드 협찬(광고) 제안서 자동 생성기
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              PRO
            </span>
          </h2>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-0.5">
            내 채널 지표와 강점을 반영해 브랜드 마케터의 눈길을 한눈에 사로잡을 정밀한 비즈니스 콜드 메일을 AI가 맞춤형으로 작성합니다.
          </p>
        </div>
      </div>

      {/* 입력 패널 */}
      <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-5 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {/* 1. 채널 주제 */}
          <div className="space-y-1.5">
            <label htmlFor="topic-input" className="block text-xs font-bold text-zinc-850 dark:text-zinc-350 uppercase tracking-wider px-1">
              🎯 내 채널 주제
            </label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-10 group-focus-within:opacity-40 transition duration-300 blur-sm pointer-events-none" />
              <input
                id="topic-input"
                type="text"
                className="relative w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-400/60 transition-colors font-sans"
                placeholder="예: 자취생 홈카페, 테크 기기 리뷰"
                value={channelTopic}
                onChange={(e) => {
                  setChannelTopic(e.target.value);
                  if (error) setError("");
                }}
              />
            </div>
          </div>

          {/* 2. 주요 시청자층 */}
          <div className="space-y-1.5">
            <label htmlFor="audience-input" className="block text-xs font-bold text-zinc-850 dark:text-zinc-350 uppercase tracking-wider px-1">
              👥 주요 시청자층
            </label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-10 group-focus-within:opacity-40 transition duration-300 blur-sm pointer-events-none" />
              <input
                id="audience-input"
                type="text"
                className="relative w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-400/60 transition-colors font-sans"
                placeholder="예: 2030 여성 직장인, 1020 대학생"
                value={targetAudience}
                onChange={(e) => {
                  setTargetAudience(e.target.value);
                  if (error) setError("");
                }}
              />
            </div>
          </div>

          {/* 3. 타겟 브랜드 */}
          <div className="space-y-1.5">
            <label htmlFor="brand-input" className="block text-xs font-bold text-zinc-850 dark:text-zinc-350 uppercase tracking-wider px-1">
              🏢 타겟 브랜드
            </label>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-10 group-focus-within:opacity-40 transition duration-300 blur-sm pointer-events-none" />
              <input
                id="brand-input"
                type="text"
                className="relative w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-400/60 transition-colors font-sans"
                placeholder="예: 네스프레소, 오늘의집"
                value={targetBrand}
                onChange={(e) => {
                  setTargetBrand(e.target.value);
                  if (error) setError("");
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 relative z-10 justify-between items-center">
          <button
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className={`w-full sm:w-auto py-3.5 px-8 rounded-xl font-extrabold text-sm text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
              isLoading
                ? "bg-zinc-850 text-zinc-500 border border-zinc-700 pointer-events-none"
                : "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:brightness-105 active:scale-95 shadow-teal-500/10"
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCcw className="w-4 h-4 animate-spin text-zinc-500" />
                <span>제안서 메일 작성 중...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>제안서 메일 자동 작성</span>
              </>
            )}
          </button>
        </div>

        {/* 퀵 프리셋 키워드 */}
        <div className="space-y-2 relative z-10 pt-2 border-t border-zinc-100 dark:border-zinc-900">
          <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block px-1">
            ⚡ 퀵 샘플 프리셋 테스트
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset, index) => (
              <button
                key={index}
                onClick={() => handlePresetClick(preset)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-700 bg-zinc-50/50 hover:bg-zinc-100 hover:border-zinc-300 dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 cursor-pointer transition-all active:scale-95"
              >
                {preset.brand} 제안
              </button>
            ))}
          </div>
        </div>
      </div>

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
      <div className="space-y-6">
        {/* 로딩용 카드 스켈레톤 */}
        {isLoading && (
          <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-900 rounded-2xl p-6 space-y-6 animate-pulse min-h-[400px]">
            <div className="space-y-2">
              <div className="w-16 h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="w-2/3 h-5 bg-zinc-150 dark:bg-zinc-900 rounded" />
            </div>
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3">
              <div className="w-full h-4 bg-zinc-100 dark:bg-zinc-900 rounded" />
              <div className="w-5/6 h-4 bg-zinc-100 dark:bg-zinc-900 rounded" />
              <div className="w-full h-24 bg-zinc-100 dark:bg-zinc-900 rounded" />
              <div className="w-2/3 h-4 bg-zinc-100 dark:bg-zinc-900 rounded" />
            </div>
          </div>
        )}

        {/* 결과 카드 렌더링 (이메일 양식 느낌의 박스) */}
        {!isLoading && result && (
          <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl shadow-xl overflow-hidden relative group">
            {/* 이메일 헤더 바 */}
            <div className="bg-zinc-100 dark:bg-zinc-900/80 px-5 py-4 border-b border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-zinc-550 dark:text-zinc-500 tracking-wider">To.</span>
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{targetBrand} 마케팅 파트너십 담당자님</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-zinc-550 dark:text-zinc-500 tracking-wider">Subject.</span>
                  <span className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white">{result.subject}</span>
                </div>
              </div>

              {/* 기능 버튼 영역 */}
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
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
                  <span>{isSaving ? "저장 중..." : saveSuccess ? "도구상자 저장됨" : "도구상자에 저장"}</span>
                </button>
                <button
                  onClick={handleCopyAll}
                  className={`py-2 px-3.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
                    copiedAll
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                      : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-white"
                  }`}
                >
                  {copiedAll ? <CheckCircle2 className="w-4 h-4 animate-scale" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedAll ? "전체 제안서 복사됨" : "전체 복사하기"}</span>
                </button>
              </div>
            </div>

            {/* 이메일 본문 영역 */}
            <div className="p-5 sm:p-7 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar text-zinc-800 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
              {/* 인사말 */}
              <div>
                <p className="font-medium text-zinc-850 dark:text-zinc-200">{result.greeting}</p>
              </div>

              {/* 채널 어필 */}
              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800 rounded-xl p-4 space-y-2">
                <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest block">
                  📢 크리에이터 채널 강점
                </span>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                  {result.channelAppeal}
                </p>
              </div>

              {/* 브랜드 시너지 */}
              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800 rounded-xl p-4 space-y-2">
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                  🤝 예상 시너지 (Synergy)
                </span>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                  {result.synergy}
                </p>
              </div>

              {/* 숏폼 기획안 */}
              <div className="bg-teal-50/40 dark:bg-teal-950/10 border border-teal-100 dark:border-teal-950/60 rounded-xl p-4 space-y-2">
                <span className="text-[10px] font-black text-teal-700 dark:text-teal-300 uppercase tracking-widest block flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  제안하는 숏폼 영상 제작 기획안
                </span>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-bold leading-relaxed">
                  {result.concept}
                </p>
              </div>

              {/* 맺음말 */}
              <div>
                <p className="font-medium text-zinc-850 dark:text-zinc-200">{result.closing}</p>
              </div>
            </div>
          </div>
        )}

        {/* 빈 대기 상태 */}
        {!result && !isLoading && (
          <div className="bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-900 rounded-2xl p-8 text-center text-zinc-500 dark:text-zinc-600">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-25" />
            <p className="text-sm font-bold">채널 주제와 오디언스, 협찬 브랜드를 작성하면</p>
            <p className="text-xs mt-1">기업 마케터들이 선호하는 고품격 협찬 제안서 메일 초안이 자동 작성됩니다</p>
          </div>
        )}
      </div>

      <hr className="my-8 border-zinc-200 dark:border-zinc-800" />
      
      <div className="text-xs sm:text-sm text-zinc-550 dark:text-zinc-400 space-y-4 leading-relaxed">
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">💡 콜드 메일(제안 메일)의 중요성</h4>
          <p>
            다양한 숏폼 플랫폼 내에서 크리에이터로서 안정적인 수익 다각화를 이룩하기 위해서는 플랫폼 정산 광고비(조회수 정산금)를 넘어서는 적극적인 브랜드 협찬(PPL) 기회 확보가 최우선 과제입니다. 수많은 경쟁 채널 사이에서 브랜드 담당자의 관심을 받으려면 단순히 '협찬해 달라'는 구걸이 아니라, 브랜드 마케팅 방향성과 채널 오디언스 지표가 창출해 낼 수 있는 비즈니스 가치(시너지)를 객관적으로 제시해야 합니다. 이 제안서 자동 생성기는 AI가 채널 특성과 맞춤 마케팅 전략을 유기적으로 결합하여, 마케터가 승인하기 편리한 형태의 기획서를 품은 세련된 콜드 메일을 순식간에 작성하도록 도와 협업의 성사율을 극대화합니다.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">📖 제안서 발송 100% 성공 가이드</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>1단계 (핵심 키워드 기입):</strong> 내 숏폼 채널에서 집중적으로 다루는 카테고리(주제), 주로 시청하는 구독자 데모그래픽(성별/연령대), 그리고 해당 영상을 통해 어필하고 싶은 타겟 브랜드명을 적어 제안서를 작성합니다.</li>
            <li><strong>2단계 (기획안 맞춤 수정):</strong> 자동 작성된 본문 내용에서 AI가 제시한 숏폼 기획안(Concept) 영역을 확인하고, 내 영상 제작 장비나 실제 구현 능력에 맞도록 템플릿의 디테일을 다듬어줍니다.</li>
            <li><strong>3단계 (미디어킷 동봉 발송):</strong> 완성된 이메일 본문을 전체 복사하여 타겟 브랜드 마케팅 팀 대표 이메일로 발송할 때, 내 채널의 핵심 조회수 분석표 및 팔로워 연령 비중 캡처본(미디어킷)을 함께 첨부하여 신뢰도를 두 배로 증가시켜 발송합니다.</li>
          </ol>
        </div>
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">🔥 마케터의 눈길을 끄는 이메일 제목 작성 꿀팁</h4>
          <p>
            브랜드 마케팅 담당자들은 매일 수십 통의 제안 메일을 받으므로 클릭하고 싶게 만드는 이메일 제목을 짓는 것이 가장 중요합니다. 제목에는 단순히 '채널 제안합니다' 대신 **'타겟팅하는 시청자층의 특징'**과 **'기대 성과'**가 직관적으로 드러나도록 하십시오. 예컨대 `[협찬제안] 2030 자취생 10만 홈카페 채널과 네스프레소의 숏폼 바이럴 시너지 제안`처럼 구체적인 수치 지표와 타겟 브랜드를 함께 명시해 주면, 담당자는 관련 마케팅 캠페인의 적합성을 한눈에 판단하여 이메일을 열어볼 가능성이 크게 증대됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

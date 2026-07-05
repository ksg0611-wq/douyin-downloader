"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolSubNav from "@/components/tools/ToolSubNav";
import { Clapperboard, Copy, CheckCircle2, Wand2 } from "lucide-react";

type TitleStyle = "curiosity" | "reversal" | "fomo";

export default function CtrTitlePage() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<TitleStyle>("curiosity");
  const [results, setResults] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = () => {
    const keyword = topic.trim() || "이것";
    
    let generated: string[] = [];
    if (style === "curiosity") {
      generated = [
        `왜 아직도 '${keyword}' 이렇게 하시나요? (충격 주의)`,
        `조회수 100만 터진 '${keyword}'의 비밀, 딱 1가지만 바꿨습니다.`,
        `'${keyword}' 전문가들이 절대 알려주지 않는 3가지 꼼수`
      ];
    } else if (style === "reversal") {
      generated = [
        `'${keyword}' 하다가 망하는 사람들의 공통점 (당장 멈추세요)`,
        `우리가 알던 '${keyword}'의 99%는 전부 가짜였습니다.`,
        `이 영상 하나로 '${keyword}' 업계의 충격적인 진실을 폭로합니다.`
      ];
    } else if (style === "fomo") {
      generated = [
        `이거 모르면 '${keyword}' 할 때마다 평생 손해 봅니다.`,
        `지금 당장 '${keyword}' 방식 바꾸지 않으면 돈(시간) 날리는 이유`,
        `아직도 '${keyword}' 모른다면, 경쟁자한테 뒤처지는 건 시간문제입니다.`
      ];
    }
    
    setResults(generated);
    setCopiedIndex(null);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-50 text-zinc-800 dark:bg-[#060609] dark:text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-white transition-colors duration-300">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Header />
      <ToolSubNav />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 pb-12 z-10 space-y-8">
        <div className="text-center space-y-3 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center border border-rose-100 dark:border-rose-500/20 shadow-sm">
              <Clapperboard className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white mt-4">
            클릭을 부르는 숏폼 타이틀 & 피드 자막 치트키
          </h1>
          <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            평범한 제목을 호기심 유발형, 반전/폭로형, 손실 회피형 등 숏폼 피드에서 무조건 스톱하게 만드는 조회수 폭발형 타이틀과 상단 고정 자막으로 변환합니다.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
          
          {/* Topic Input */}
          <div className="space-y-3">
            <label className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center text-xs">1</span>
              영상 핵심 주제 (키워드) 입력
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: 다이어트 식단, 엑셀 꿀팁, 영어 회화 등"
              className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
          </div>

          {/* Style Selection */}
          <div className="space-y-3">
            <label className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center text-xs">2</span>
              변환 스타일 선택
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "curiosity", label: "🤔 호기심 유발형" },
                { id: "reversal", label: "🔥 반전·폭로형" },
                { id: "fomo", label: "🚨 손실 회피형" }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id as TitleStyle)}
                  className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border ${
                    style === s.id
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 shadow-inner"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleGenerate}
              className="w-full py-4 bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
            >
              <Wand2 className="w-5 h-5" />
              치트키 멘트 생성
            </button>
          </div>
        </div>

        {/* Results Area */}
        {results.length > 0 && (
          <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 md:p-8 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-2">✨ 생성된 피드 상단 고정 자막 / 타이틀</h3>
            
            <div className="space-y-3">
              {results.map((text, idx) => (
                <div 
                  key={idx} 
                  className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 transition-colors hover:border-rose-500/30 dark:hover:border-rose-500/30"
                >
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 font-bold flex-1 break-keep">
                    {text}
                  </p>
                  <button
                    onClick={() => handleCopy(text, idx)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                      copiedIndex === idx
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                        : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 dark:bg-zinc-950 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    {copiedIndex === idx ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedIndex === idx ? "복사됨!" : "복사하기"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

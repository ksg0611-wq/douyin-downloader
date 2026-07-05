"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolSubNav from "@/components/tools/ToolSubNav";
import { MessageSquare, Copy, CheckCircle2, Wand2 } from "lucide-react";

type EngagementStyle = "balance" | "empathy";

export default function CommentEngagementPage() {
  const [keyword, setKeyword] = useState("");
  const [style, setStyle] = useState<EngagementStyle>("balance");
  const [result, setResult] = useState<{ angle: string; questions: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const kw = keyword.trim() || "이것";
    
    let generatedResult;
    if (style === "balance") {
      generatedResult = {
        angle: `'${kw}'에 대해 A vs B로 나뉘는 극단적인 딜레마 상황을 연출하세요. 시청자들이 무조건 자신의 의견을 주장하고 싶게 만드는 것이 핵심입니다.`,
        questions: [
          `솔직히 '${kw}'할 때 이거 인정? 여러분은 무조건 전자 vs 후자?`,
          `만약 평생 '${kw}' 딱 하나만 선택해야 한다면? 댓글로 이유를 적어주세요! 극단적일수록 좋습니다.`
        ]
      };
    } else {
      generatedResult = {
        angle: `누구나 한 번쯤 겪어봤을 '${kw}' 관련 답답한(또는 당황스러운) 상황을 과장되게 연출하여 '내 얘기다'라는 뼈 때리는 공감을 이끌어내세요.`,
        questions: [
          `이거 완전 내 얘기 ㅋㅋㅋ 혹시 주변에 이런 '${kw}' 빌런 꼭 있지 않나요? @태그해서 알려주세요!`,
          `'${kw}' 때문에 진짜 킹받았던 썰 풀고 가주세요 👇 제일 어이없는 썰 고정해드립니다.`
        ]
      };
    }
    
    setResult(generatedResult);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `[바이럴 기획 각도]\n${result.angle}\n\n[고정 댓글 유도 질문]\n1. ${result.questions[0]}\n2. ${result.questions[1]}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-50 text-zinc-800 dark:bg-[#060609] dark:text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-white transition-colors duration-300">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Header />
      <ToolSubNav />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 pb-12 z-10 space-y-8">
        <div className="text-center space-y-3 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
              <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white mt-4">
            댓글 떡상용 논쟁·공감 소재 발전기
          </h1>
          <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            평범한 일상/지식 주제를 시청자들이 댓글 창에서 치열하게 토론하거나 격하게 공감할 수밖에 없는 바이럴 소재로 비틀어주고, 고정 댓글용 질문까지 세트로 추천합니다.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
          
          {/* Keyword Input */}
          <div className="space-y-3">
            <label className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center text-xs">1</span>
              영상 핵심 소재/키워드 입력
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="예: 민트초코, 출근길, 인간관계 등"
              className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Style Selection */}
          <div className="space-y-3">
            <label className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center text-xs">2</span>
              바이럴 방향성 선택
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setStyle("balance")}
                className={`py-4 px-4 rounded-xl text-sm font-bold transition-all border ${
                  style === "balance"
                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 shadow-inner"
                    : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                ⚔️ 밸런스 게임형 (댓글 논쟁 유도)
              </button>
              <button
                onClick={() => setStyle("empathy")}
                className={`py-4 px-4 rounded-xl text-sm font-bold transition-all border ${
                  style === "empathy"
                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 shadow-inner"
                    : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                😭 격한 공감 유발형 (뼈 때리는 팩트)
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleGenerate}
              className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Wand2 className="w-5 h-5" />
              바이럴 소재 세트 생성
            </button>
          </div>
        </div>

        {/* Results Area */}
        {result && (
          <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                ✨ 추천 소재 & 댓글 질문 세트
              </h3>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  copied
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "전체 복사됨!" : "전체 복사하기"}
              </button>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">🎯 숏폼 기획 각도</h4>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                    {result.angle}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">💬 고정 댓글 유도 질문</h4>
                <div className="space-y-2">
                  <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                      1. {result.questions[0]}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
                      2. {result.questions[1]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

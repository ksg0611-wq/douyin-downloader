"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolSubNav from "@/components/tools/ToolSubNav";
import { Puzzle, Copy, CheckCircle2, Wand2 } from "lucide-react";

type FrameworkType = "PAS" | "AIDA" | "3STEP";

export default function ScriptFrameworkPage() {
  const [activeTab, setActiveTab] = useState<FrameworkType>("PAS");
  
  // PAS Fields
  const [pasP, setPasP] = useState("");
  const [pasA, setPasA] = useState("");
  const [pasS, setPasS] = useState("");

  // AIDA Fields
  const [aidaA, setAidaA] = useState("");
  const [aidaI, setAidaI] = useState("");
  const [aidaD, setAidaD] = useState("");
  const [aidaAction, setAidaAction] = useState("");

  // 3STEP Fields
  const [step1, setStep1] = useState("");
  const [step2, setStep2] = useState("");
  const [step3, setStep3] = useState("");

  const [resultText, setResultText] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    let combined = "";
    if (activeTab === "PAS") {
      combined = `${pasP}\n\n${pasA}\n\n${pasS}`;
    } else if (activeTab === "AIDA") {
      combined = `${aidaA}\n\n${aidaI}\n\n${aidaD}\n\n${aidaAction}`;
    } else if (activeTab === "3STEP") {
      combined = `${step1}\n\n${step2}\n\n${step3}`;
    }
    setResultText(combined.trim());
    setCopied(false);
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-50 text-zinc-800 dark:bg-[#060609] dark:text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-white transition-colors duration-300">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Header />
      <ToolSubNav />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 pb-12 z-10 space-y-8">
        <div className="text-center space-y-3 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center border border-cyan-100 dark:border-cyan-500/20 shadow-sm">
              <Puzzle className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white mt-4">
            바이럴 대본 프레임워크 조립기
          </h1>
          <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            PAS, AIDA 등 검증된 마케팅 공식을 숏폼 길이에 맞게 압축하여, 빈칸만 채우면 기승전결이 완벽한 대본 초안을 자동 완성해 줍니다.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 md:p-8 shadow-sm">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {(["PAS", "AIDA", "3STEP"] as FrameworkType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setResultText("");
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {tab === "PAS" ? "PAS 공식" : tab === "AIDA" ? "AIDA 공식" : "3단 논법"}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {activeTab === "PAS" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center text-xs">P</span>
                    문제 제기 (Problem)
                  </label>
                  <textarea
                    value={pasP}
                    onChange={(e) => setPasP(e.target.value)}
                    placeholder="예: 숏폼 조회수가 100에서 멈춰서 답답하신가요?"
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none h-24"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center text-xs">A</span>
                    문제 자극 (Agitate)
                  </label>
                  <textarea
                    value={pasA}
                    onChange={(e) => setPasA(e.target.value)}
                    placeholder="예: 대본 퀄리티를 올리지 않으면 아무리 영상 편집에 힘을 쏟아도 스크롤을 넘겨버립니다."
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none h-24"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center text-xs">S</span>
                    해결책 제시 (Solve)
                  </label>
                  <textarea
                    value={pasS}
                    onChange={(e) => setPasS(e.target.value)}
                    placeholder="예: 이제 이 3가지 프레임워크만 템플릿에 맞춰 적용해 보세요. 시청 시간 그래프가 달라집니다."
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none h-24"
                  />
                </div>
              </>
            )}

            {activeTab === "AIDA" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center text-xs">A</span>
                    시선 강탈 (Attention)
                  </label>
                  <textarea
                    value={aidaA}
                    onChange={(e) => setAidaA(e.target.value)}
                    placeholder="예: 대한민국 1%만 아는 비밀 기법 공개합니다."
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none h-20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center text-xs">I</span>
                    흥미 유발 (Interest)
                  </label>
                  <textarea
                    value={aidaI}
                    onChange={(e) => setAidaI(e.target.value)}
                    placeholder="예: 이 방법 하나로 제 채널은 한 달 만에 구독자가 10만 명 늘었습니다."
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none h-20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center text-xs">D</span>
                    욕구 자극 (Desire)
                  </label>
                  <textarea
                    value={aidaD}
                    onChange={(e) => setAidaD(e.target.value)}
                    placeholder="예: 이 영상 끝까지 보시면 여러분도 내일부터 바로 떡상 열차 탈 수 있습니다."
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none h-20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center text-xs">A</span>
                    행동 지시 (Action)
                  </label>
                  <textarea
                    value={aidaAction}
                    onChange={(e) => setAidaAction(e.target.value)}
                    placeholder="예: 지금 바로 프로필 링크 클릭해서 무료 전자책 받아가세요."
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none h-20"
                  />
                </div>
              </>
            )}

            {activeTab === "3STEP" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center text-xs">1</span>
                    팩트 전제 (대전제)
                  </label>
                  <textarea
                    value={step1}
                    onChange={(e) => setStep1(e.target.value)}
                    placeholder="예: 모든 인간은 하루에 24시간만 가지고 있습니다."
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none h-24"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center text-xs">2</span>
                    현상 분석 (소전제)
                  </label>
                  <textarea
                    value={step2}
                    onChange={(e) => setStep2(e.target.value)}
                    placeholder="예: 하지만 성공한 사람들은 그 시간을 복리로 활용하는 시스템을 가지고 있습니다."
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none h-24"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center justify-center text-xs">3</span>
                    최종 행동 (결론)
                  </label>
                  <textarea
                    value={step3}
                    onChange={(e) => setStep3(e.target.value)}
                    placeholder="예: 그러니 당장 당신의 24시간을 레버리지 할 수 있는 도구를 세팅하세요."
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none h-24"
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={handleGenerate}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <Wand2 className="w-5 h-5" />
              대본 조립하기
            </button>
          </div>
        </div>

        {/* Result Area */}
        {resultText && (
          <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                ✨ 완성된 대본 초안
              </h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "복사됨!" : "복사하기"}
              </button>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
              <p className="whitespace-pre-line text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {resultText}
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

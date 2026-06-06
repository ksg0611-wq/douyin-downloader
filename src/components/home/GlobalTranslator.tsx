"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Globe,
  Search,
  RefreshCcw,
  Copy,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Sparkles,
  ChevronRight,
} from "lucide-react";

// ── 탭 정의 ──
const LANG_TABS = [
  { key: "en", flag: "🇺🇸", label: "영어 (EN)" },
  { key: "ja", flag: "🇯🇵", label: "일본어 (JA)" },
  { key: "vi", flag: "🇻🇳", label: "베트남어 (VI)" },
  { key: "summary", flag: "💡", label: "종합 전략" },
] as const;

type LangKey = (typeof LANG_TABS)[number]["key"];

interface TranslateResult {
  full: string;
  sections: Record<LangKey, string>;
}

// ── 마크다운 렌더러 (테이블 지원) ──
function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];
  let inTable = false;

  const flushTable = (key: string) => {
    if (tableBuffer.length === 0) return;
    const rows = tableBuffer.filter(l => !/^[\s|:-]+$/.test(l.replace(/[|]/g, "")));
    const parsed = rows.map(r =>
      r.split("|").filter((_, i, a) => i !== 0 && i !== a.length - 1).map(c => c.trim())
    );
    const [header, ...body] = parsed;
    elements.push(
      <div key={`tbl-${key}`} className="overflow-x-auto my-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left border-collapse min-w-[420px]">
          <thead>
            <tr className="bg-violet-50/50 dark:bg-violet-950/40 border-b border-zinc-200 dark:border-zinc-700">
              {header?.map((h, j) => (
                <th key={j} className="px-3 py-2.5 text-[11px] font-black text-violet-850 dark:text-violet-300 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, i) => (
              <tr key={i} className="border-b border-zinc-200 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-violet-950/10 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2.5 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
    inTable = false;
  };

  lines.forEach((line, i) => {
    const isTableLine = line.trim().startsWith("|") && line.trim().endsWith("|");
    if (isTableLine) {
      inTable = true;
      tableBuffer.push(line);
      return;
    }
    if (inTable) flushTable(String(i));

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-sm font-black text-zinc-900 dark:text-white mt-5 mb-3 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <BookOpen className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 shrink-0" />
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="text-base font-black text-zinc-900 dark:text-white mt-4 mb-2">{line.slice(2)}</h1>);
    } else if (line.startsWith("---")) {
      elements.push(<hr key={i} className="border-zinc-200 dark:border-zinc-800 my-4" />);
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-2 border-violet-500 pl-3 text-zinc-800 dark:border-l-2 dark:border-violet-500/50 dark:pl-3 dark:text-violet-200/80 italic text-xs my-2">
          {line.slice(2)}
        </blockquote>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(<li key={i} className="text-xs text-zinc-705 dark:text-zinc-300 ml-4 list-disc leading-relaxed">{line.slice(2)}</li>);
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-1.5" />);
    } else {
      const html = line
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-zinc-950 dark:text-white font-bold">$1</strong>')
        .replace(/`(.+?)`/g, '<code class="bg-zinc-100 dark:bg-zinc-800 text-cyan-600 dark:text-cyan-300 px-1 py-0.5 rounded text-[10px] font-mono">$1</code>');
      elements.push(
        <p key={i} className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
      );
    }
  });

  if (inTable) flushTable("end");
  return <>{elements}</>;
}

// ── 퀵 샘플 제목 ──
const QUICK_SAMPLES = [
  "단 3분 만에 완성하는 매운 불닭 라면 레시피",
  "오늘 뭐 먹지? 집에서 만드는 초간단 혼밥 메뉴",
  "직장인 점심 추천! 편의점 꿀조합 TOP5",
  "10kg 감량 성공한 내 다이어트 루틴 공개",
  "강아지가 처음 고양이를 만났을 때 반응",
];

export default function GlobalTranslator() {
  const [inputText, setInputText] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<TranslateResult | null>(null);
  const [error, setError] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<LangKey>("en");
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const handleTranslate = async (text?: string) => {
    const target = (text ?? inputText).trim();
    if (!target) {
      setError("번역할 한국어 제목을 입력해 주세요.");
      return;
    }
    setIsLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/global-translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "번역 실패");
      setResult(data);
      setActiveTab("en");
      if (text) setInputText(text);
    } catch (e: any) {
      const msg = e.message || "알 수 없는 오류가 발생했습니다.";
      setError(msg.startsWith("⚠") || msg.startsWith("💡") ? msg : `⚠️ ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const currentSection = result?.sections[activeTab] ?? "";

  return (
    <section id="global-translator" className="max-w-4xl mx-auto">
      {/* 섹션 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
            🌐 다국어 숏폼 제목 번역 & 마케팅 피드백
          </h2>
          <p className="text-xs text-zinc-550 dark:text-zinc-500">
            Gemini AI가 현지 감성으로 의역 — 영어 · 일본어 · 베트남어 × 3가지 바이럴 스타일
          </p>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-xl dark:shadow-2xl relative overflow-hidden">
        {/* 배경 글로우 */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* 입력 영역 */}
        <div className="space-y-3 mb-4 relative">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl opacity-0 group-focus-within:opacity-50 transition duration-300 blur-sm pointer-events-none" />
            <div className="relative">
              <textarea
                id="global-translate-input"
                value={inputText}
                onChange={(e) => { setInputText(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handleTranslate(); }}
                placeholder="번역할 한국어 숏폼 제목 또는 내용을 입력하세요&#10;(예: 단 3분 만에 완성하는 매운 불닭 라면 레시피)&#10;Ctrl+Enter로 바로 분석"
                rows={3}
                className="w-full bg-zinc-50 border border-zinc-250 dark:bg-zinc-900 dark:border-zinc-700 rounded-xl px-4 py-3.5 text-sm text-zinc-800 placeholder-zinc-400 dark:text-zinc-100 dark:placeholder-zinc-505 focus:outline-none focus:border-violet-500/60 resize-none font-sans leading-relaxed transition-colors"
              />
            </div>
          </div>

          <button
            id="global-translate-btn"
            onClick={() => handleTranslate()}
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:brightness-110 active:scale-[0.99] text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-violet-950/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/5 hover:bg-transparent pointer-events-none" />
            {isLoading ? (
              <>
                <RefreshCcw className="w-4 h-4 animate-spin" />
                <span>AI가 바이럴 타이틀을 생성 중입니다...</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                <span>🌐 글로벌 바이럴 분석 시작</span>
              </>
            )}
          </button>
        </div>

        {/* 퀵 샘플 */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          <span className="text-[10px] text-zinc-500 dark:text-zinc-600 font-bold uppercase tracking-wider self-center mr-1">샘플:</span>
          {QUICK_SAMPLES.map((s, i) => (
            <button
              key={i}
              onClick={() => handleTranslate(s)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-zinc-105 hover:bg-zinc-200 border border-zinc-200 text-zinc-650 hover:text-zinc-900 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 dark:border-zinc-700/60 dark:text-zinc-400 dark:hover:text-zinc-100 text-[10px] font-medium transition-all cursor-pointer disabled:opacity-50 max-w-[180px] truncate"
            >
              {s}
            </button>
          ))}
        </div>

        {/* 에러 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:border-amber-500/30 dark:text-amber-300 mb-4 leading-relaxed"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 로딩 스켈레톤 */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* 로딩 애니메이션 배너 */}
              <div className="bg-violet-50 border border-violet-100 dark:bg-violet-950/30 dark:border-violet-500/20 rounded-xl p-4 flex items-center gap-4">
                <div className="flex items-end gap-0.5 h-7 shrink-0">
                  {[0.5, 0.8, 1, 0.7, 0.9, 0.6, 1, 0.8].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-violet-500 to-indigo-300 rounded-full animate-pulse"
                      style={{ height: `${h * 100}%`, animationDelay: `${i * 100}ms`, animationDuration: `${700 + i * 60}ms` }}
                    />
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold text-violet-850 dark:text-violet-300">AI가 3개 언어 × 3가지 바이럴 스타일을 생성 중...</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-0.5">약 10~20초 소요됩니다. 잠시만 기다려 주세요 ☕</p>
                </div>
              </div>
              {/* 스켈레톤 */}
              <div className="h-8 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl animate-pulse w-2/3" />
              <div className="h-32 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 결과 카드 뷰어 */}
        <AnimatePresence>
          {result && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 80 }}
              className="space-y-4"
            >
              {/* 성공 배지 */}
              <div className="flex items-center gap-2 text-xs text-emerald-650 dark:text-emerald-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>3개 언어 × 3가지 스타일 바이럴 타이틀 생성 완료!</span>
              </div>

              {/* 탭 네비게이션 */}
              <div className="flex flex-wrap gap-1.5">
                {LANG_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      activeTab === tab.key
                        ? "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-600/20 dark:border-violet-500/50 dark:text-violet-200 shadow-sm"
                        : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-800 dark:bg-zinc-800/60 dark:border-zinc-700/60 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
                    }`}
                  >
                    <span>{tab.flag}</span>
                    <span>{tab.label}</span>
                    {activeTab === tab.key && <ChevronRight className="w-3 h-3" />}
                  </button>
                ))}
              </div>

              {/* 탭 콘텐츠 */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="bg-zinc-50/50 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-800/60 rounded-xl overflow-hidden"
                >
                  {/* 탭 헤더 바 */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-100/80 border-b border-zinc-250 dark:bg-zinc-900/60 dark:border-zinc-800/50">
                    <span className="text-xs font-black text-zinc-800 dark:text-zinc-300 flex items-center gap-1.5">
                      {LANG_TABS.find(t => t.key === activeTab)?.flag}
                      {LANG_TABS.find(t => t.key === activeTab)?.label}
                    </span>
                    <button
                      onClick={() => handleCopy(activeTab, currentSection)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        copiedKey === activeTab
                          ? "bg-emerald-50 border-emerald-250 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                          : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-850 hover:border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-white dark:hover:border-zinc-600"
                      }`}
                    >
                      {copiedKey === activeTab ? (
                        <><CheckCircle2 className="w-3 h-3" /><span>복사됨</span></>
                      ) : (
                        <><Copy className="w-3 h-3" /><span>📋 복사</span></>
                      )}
                    </button>
                  </div>

                  {/* 마크다운 본문 */}
                  <div className="p-4 max-h-[420px] overflow-y-auto custom-scrollbar space-y-1">
                    {currentSection ? (
                      <MarkdownRenderer text={currentSection} />
                    ) : (
                      <p className="text-xs text-zinc-500 italic">이 섹션의 결과가 없습니다.</p>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* 언어별 개별 복사 빠른 버튼 */}
              <div className="space-y-2">
                <p className="text-[10px] text-zinc-500 dark:text-zinc-650 font-bold uppercase tracking-wider">언어별 빠른 복사</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LANG_TABS.map((tab) => (
                    <button
                      key={`quick-${tab.key}`}
                      onClick={() => handleCopy(`quick-${tab.key}`, result.sections[tab.key])}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        copiedKey === `quick-${tab.key}`
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                          : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-850 hover:bg-zinc-50 dark:bg-zinc-800/60 dark:border-zinc-700/60 dark:text-zinc-400 dark:hover:border-violet-500/40 dark:hover:text-violet-200 dark:hover:bg-violet-600/10"
                      }`}
                    >
                      {copiedKey === `quick-${tab.key}` ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-60" />
                      )}
                      <span>{tab.flag} {tab.label.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 재번역 버튼 */}
              <button
                onClick={() => handleTranslate()}
                className="w-full py-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:hover:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>다시 생성하기</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 빈 상태 */}
        {!result && !isLoading && !error && (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-600">
            <Globe className="w-10 h-10 mx-auto mb-3 opacity-25" />
            <p className="text-sm font-medium">한국어 제목을 입력하거나 샘플을 클릭하면</p>
            <p className="text-xs mt-1">영어 · 일본어 · 베트남어로 바이럴 번역이 시작됩니다</p>
          </div>
        )}
      </div>

      <hr className="my-8 border-zinc-200 dark:border-zinc-800" />
      
      <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 space-y-4 leading-relaxed">
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">💡 다국어 숏폼 제목 번역의 필요성</h4>
          <p>
            숏폼 영상 플랫폼(틱톡, 유튜브 쇼츠, 인스타그램 릴스 등)은 글로벌 알고리즘을 통해 전 세계 시청자에게 쉽게 도달할 수 있는 크로스보더 채널의 성격을 띠고 있습니다. 단순히 일반 번역기로 제목을 직역하면 현지 유저의 문화적 맥락이나 유머 코드를 반영하지 못해 클릭률(CTR)과 도달 범위가 현저히 떨어집니다. 이 다국어 숏폼 제목 번역 도구는 현지 원어민이 사용하는 바이럴 스타일의 표현을 반영하고 종합 전략을 제공하여 글로벌 시청자의 시선을 순식간에 사로잡는 데 도움을 줍니다.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">📖 100% 활용 가이드</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>1단계 (한국어 제목 입력):</strong> 내가 제작한 숏폼 영상의 핵심 주제 또는 기존 한국어 제목을 입력창에 작성합니다.</li>
            <li><strong>2단계 (글로벌 바이럴 분석):</strong> '글로벌 바이럴 분석 시작' 버튼을 누르면 AI가 각 언어별(영어, 일본어, 베트남어) 바이럴 타이틀 스타일과 현지화 팁이 담긴 종합 전략을 제공합니다.</li>
            <li><strong>3단계 (현지 맞춤 업로드):</strong> 제공된 번역 제목 중 내 영상 톤앤매너에 어울리는 최적의 키워드를 복사하여 타겟 국가의 업로드 메타데이터로 적용합니다.</li>
          </ol>
        </div>
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">🔥 크리에이터 실전 꿀팁</h4>
          <p>
            해외 타겟팅 숏폼 영상을 기획할 때는 제목뿐만 아니라 자막이나 영상 초반 오디오에도 번역된 주요 키워드를 함께 시각적으로 배치하는 것이 알고리즘 유입을 높이는 핵심 비결입니다. 예를 들어 영어권 유저를 타겟팅할 때는 강렬한 의성어(WOW, POV)나 질문형 문장을 썸네일과 제목에 적절히 노출시키고, 일본어권 유저를 공략할 때는 공감을 불러일으키는 문구나 호기심을 유발하는 말줄임표(...) 표현을 활용하면 더욱 효과적입니다.
          </p>
        </div>
      </div>

    </section>
  );
}

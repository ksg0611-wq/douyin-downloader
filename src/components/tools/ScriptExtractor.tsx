"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  RefreshCcw, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Link2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sendGAEvent } from "@next/third-parties/google";

interface ScriptExtractorProps {
  lang?: "ko" | "en";
}

export default function ScriptExtractor({ lang = "ko" }: ScriptExtractorProps) {
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [resultText, setResultText] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [scriptExpanded, setScriptExpanded] = useState<boolean>(true);

  // Friendly error converter
  const toFriendlyError = (msg: string): string => {
    if (!msg) return '⚠️ 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    if (msg.startsWith('네') || msg.startsWith('⚠') || msg.startsWith('💡')) return msg;
    if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit') || msg.includes('RATE_LIMIT')) {
      return '💡 현재 AI 요청량이 많아 잠시 제한되었습니다. 1분 뒤에 다시 시도해 주세요!';
    }
    if (msg.includes('503') || msg.toLowerCase().includes('high demand') || msg.toLowerCase().includes('overload')) {
      return '💡 현재 AI 요청량이 많아 잠시 제한되었습니다. 1분 뒤에 다시 시도해 주세요!';
    }
    return '⚠️ AI 대본 분석 중 오류가 발생했습니다. 올바른 비디오 주소인지 확인한 후 다시 시도해 주세요.';
  };

  const handleExtract = async () => {
    const targetUrl = url.trim();
    if (!targetUrl) {
      setError(lang === "ko" ? "분석할 동영상/오디오 링크를 입력해 주세요." : "Please enter a video or audio link to analyze.");
      return;
    }

    setIsLoading(true);
    setLoadingStep(lang === "ko" ? "비디오 메타데이터를 수집하는 중..." : "Fetching video metadata...");
    setError("");
    setResultText("");
    sendGAEvent({ event: "generate_click", value: "script_extractor" });

    try {
      let audioUrl = targetUrl;
      let videoTitle = "Direct Link Audios";

      // 1. Check if Douyin / Xiaohongshu url
      const isPlatformUrl = targetUrl.includes("douyin.com") || 
                            targetUrl.includes("v.douyin") || 
                            targetUrl.includes("xiaohongshu.com") || 
                            targetUrl.includes("xhslink.com");

      if (isPlatformUrl) {
        setLoadingStep(lang === "ko" ? "플랫폼 서버에서 비디오 스트림을 안전하게 추출하는 중..." : "Resolving video stream...");
        const platform = (targetUrl.includes("xiaohongshu.com") || targetUrl.includes("xhslink.com")) ? "xiaohongshu" : "douyin";
        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: targetUrl, platform }),
        });

        const analyzeData = await analyzeRes.json();
        if (!analyzeRes.ok || !analyzeData.success) {
          throw new Error(analyzeData.error || "비디오 데이터를 가져오지 못했습니다.");
        }

        audioUrl = analyzeData.data.realAudioUrl;
        videoTitle = analyzeData.data.title;

        if (!audioUrl) {
          throw new Error("분석 가능한 고품질 오디오 트랙을 확보하지 못했습니다.");
        }
      }

      // 2. Call extract-script
      setLoadingStep(lang === "ko" ? "AI가 오디오 음성을 인식하고 번역하는 중 (약 10-20초)..." : "AI recognizing audio and translating...");
      const response = await fetch("/api/extract-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl, videoTitle }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || data.error || "대본 추출 실패");
      }

      setResultText(data.script);
    } catch (err: any) {
      setError(toFriendlyError(err.message));
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      // safe bypass
    }
  };

  // Markdown line parser for rendering result nicely
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let tableRows: React.ReactNode[] = [];
    let tableHeaderParsed = false;

    const flushTable = (key: string) => {
      if (tableRows.length > 0) {
        elements.push(
          <div key={`tbl-${key}`} className="overflow-x-auto my-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left border-collapse">
              <tbody>{tableRows}</tbody>
            </table>
          </div>
        );
        tableRows = [];
        tableHeaderParsed = false;
      }
    };

    lines.forEach((line, i) => {
      const isTableLine = line.startsWith("|") && line.endsWith("|");
      const isSeparator = isTableLine && line.split("|").filter(c => c.trim()).every(c => /^[-:]+$/.test(c.trim()));

      if (isTableLine && !isSeparator) {
        const cells = line.split("|").filter((c) => c.trim() !== "");
        if (!tableHeaderParsed) {
          tableRows.push(
            <tr key={i} className="bg-teal-50/50 dark:bg-teal-950/40 border-b border-zinc-200 dark:border-zinc-800">
              {cells.map((c, j) => (
                <th key={j} className="px-4 py-2.5 text-xs font-black text-teal-855 dark:text-teal-350 whitespace-nowrap">{c.trim()}</th>
              ))}
            </tr>
          );
          tableHeaderParsed = true;
        } else {
          tableRows.push(
            <tr key={i} className="border-b border-zinc-250 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-teal-950/10 transition-colors">
              {cells.map((c, j) => (
                <td key={j} className="px-4 py-2.5 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">{c.trim()}</td>
              ))}
            </tr>
          );
        }
      } else if (isSeparator) {
        // Skip separators
      } else {
        flushTable(String(i));
        if (line.startsWith("## ")) {
          elements.push(
            <h2 key={i} className="text-sm font-black text-cyan-600 dark:text-cyan-400 mt-6 mb-3 flex items-center gap-1.5 border-b border-cyan-100 dark:border-cyan-950/40 pb-2">
              <BookOpen className="w-4 h-4 shrink-0" />
              {line.slice(3)}
            </h2>
          );
        } else if (line.startsWith("### ")) {
          elements.push(<h3 key={i} className="text-xs font-bold text-teal-700 dark:text-teal-400 mt-4 mb-2">{line.slice(4)}</h3>);
        } else if (line.startsWith("# ")) {
          elements.push(<h1 key={i} className="text-base font-black text-zinc-950 dark:text-white mt-5 mb-3">{line.slice(2)}</h1>);
        } else if (line.startsWith("> ")) {
          elements.push(<blockquote key={i} className="border-l-4 border-yellow-500 pl-3.5 text-yellow-750 dark:border-yellow-600 dark:text-yellow-355 italic text-xs my-2.5 bg-yellow-50/30 dark:bg-yellow-950/10 py-1 rounded-r-md">{line.slice(2)}</blockquote>);
        } else if (line.startsWith("---")) {
          elements.push(<hr key={i} className="border-zinc-200 dark:border-zinc-800 my-4" />);
        } else if (line.startsWith("- ") || line.startsWith("* ")) {
          elements.push(<li key={i} className="text-xs text-zinc-700 dark:text-zinc-300 ml-5 list-disc leading-relaxed my-1">{line.slice(2)}</li>);
        } else if (/^\d+\.\s/.test(line)) {
          elements.push(<li key={i} className="text-xs text-zinc-700 dark:text-zinc-300 ml-5 list-decimal leading-relaxed my-1">{line.replace(/^\d+\.\s/, "")}</li>);
        } else if (line.trim() === "") {
          elements.push(<div key={i} className="h-2" />);
        } else {
          const html = line
            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-zinc-950 dark:text-white font-extrabold">$1</strong>')
            .replace(/`(.+?)`/g, '<code class="bg-zinc-100 dark:bg-zinc-900 text-cyan-600 dark:text-cyan-400 px-1.5 py-0.5 rounded text-[10px] font-mono">$1</code>');
          elements.push(<p key={i} className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed my-1.5" dangerouslySetInnerHTML={{ __html: html }} />);
        }
      }
    });
    flushTable("end");
    return elements;
  };

  return (
    <div id="script-extractor-container" className="w-full max-w-4xl mx-auto">
      {/* 1. Title Header & SEO Seed Text */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
          <FileText className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            📝 AI 대본 추출 및 요약기 (AI Script Extractor)
          </h2>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-1">
            본 도구는 동영상의 음성 트랙 및 오디오를 정밀 스캔하여 타임라인별 원문 대본과 고화질 한국어 번역 텍스트를 자동으로 추출합니다. 3줄 핵심 요약 피드와 벤치마킹 적용 방안을 담은 마케팅 분석 보고서를 동시에 제공하여 글로벌 트렌드 수집 프로세스를 혁신합니다.
          </p>
        </div>
      </div>

      {/* 2. Input Box */}
      <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-5 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2.5 relative z-10">
          <label htmlFor="url-input" className="block text-xs font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider px-1">
            🔗 분석할 영상 또는 오디오 주소 입력
          </label>

          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl opacity-15 group-focus-within:opacity-40 transition duration-300 blur-sm pointer-events-none" />
              <div className="relative flex items-center">
                <Link2 className="absolute left-4 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                <input
                  id="url-input"
                  type="text"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-teal-500 transition-colors font-sans"
                  placeholder={lang === "ko" 
                    ? "도우인, 샤오홍슈 영상 링크 또는 직접 다운로드 가능한 mp3 오디오 주소를 입력하세요."
                    : "Enter Douyin, Xiaohongshu url, or raw mp3 audio link."}
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError("");
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleExtract}
                disabled={isLoading}
                className={`py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg w-full sm:w-auto ${
                  isLoading
                    ? "bg-zinc-850 text-zinc-500 border border-zinc-700 pointer-events-none"
                    : "bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 hover:brightness-105 active:scale-95 shadow-teal-500/10"
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCcw className="w-4 h-4 animate-spin text-zinc-500" />
                    <span>대본 추출 중...</span>
                  </>
                ) : (
                  <>
                    <span>대본 추출 및 요약 시작</span>
                    <span>⚡</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Loading details */}
        <AnimatePresence>
          {isLoading && loadingStep && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2 border-t border-zinc-100 dark:border-zinc-900"
            >
              <div className="bg-teal-50/40 border border-teal-100 dark:bg-teal-950/20 dark:border-teal-950/40 rounded-xl p-4 flex flex-col items-center gap-3">
                <div className="flex items-end gap-1 h-8">
                  {[0.4, 0.7, 1, 0.8, 0.5, 0.9, 0.6, 1, 0.7, 0.4].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-teal-500 to-cyan-400 rounded-full animate-pulse"
                      style={{
                        height: `${h * 100}%`,
                        animationDelay: `${i * 80}ms`,
                        animationDuration: "800ms",
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs font-bold text-teal-850 dark:text-teal-300 text-center">
                  {loadingStep}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-500/30 dark:text-rose-350 rounded-xl p-4 text-xs"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Markdown Output */}
        <AnimatePresence>
          {resultText && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-teal-200 dark:border-teal-500/25 bg-gradient-to-b from-teal-50/20 to-zinc-50/5 dark:from-teal-950/10 dark:to-zinc-950/40 rounded-xl overflow-hidden mt-6"
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-teal-100 dark:border-teal-500/20 bg-teal-50/40 dark:bg-teal-950/30">
                <span className="text-xs font-extrabold text-teal-850 dark:text-teal-350 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  📜 AI 추출 타임라인 대본 및 인사이트 보고서
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 px-3 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">복사됨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>전체 복사</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setScriptExpanded(p => !p)}
                    className="p-1.5 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-all cursor-pointer"
                  >
                    {scriptExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* MD Render */}
              <AnimatePresence>
                {scriptExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-5 max-h-[480px] overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-950 font-sans"
                  >
                    {renderMarkdown(resultText)}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

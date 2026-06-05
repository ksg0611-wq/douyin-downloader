import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Video, Play, Music, RefreshCcw, CheckCircle2, Sparkles, Copy, FileText, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { VideoMock } from "../../types";
import CPABanner from "../CPABanner";
import { CPA_ADS } from "@/data/ads";

interface DownloadResultProps {
  analysisResult: VideoMock;
  downloadProgress: number | null;
  downloadCompleted: boolean;
  downloadType: "video" | "audio" | null;
  setPreviewVideo: (val: VideoMock | null) => void;
  triggerDownloadAction: (type: "video" | "audio") => void;
  handleReset: () => void;
  showToast?: (msg: string) => void;
}

export default function DownloadResult({
  analysisResult,
  downloadProgress,
  downloadCompleted,
  downloadType,
  setPreviewVideo,
  triggerDownloadAction,
  handleReset,
  showToast
}: DownloadResultProps) {
  const [thumbnailProgress, setThumbnailProgress] = React.useState<boolean>(false);
  const [captionText, setCaptionText] = React.useState<string>("");
  const [isGenerating, setIsGenerating] = React.useState<boolean>(false);
  const [isCopied, setIsCopied] = React.useState<boolean>(false);
  const [captionError, setCaptionError] = React.useState<string>("");

  // AI 대본 추출 관련 state
  const [scriptText, setScriptText] = React.useState<string>("");
  const [isExtractingScript, setIsExtractingScript] = React.useState<boolean>(false);
  const [isScriptCopied, setIsScriptCopied] = React.useState<boolean>(false);
  const [scriptExpanded, setScriptExpanded] = React.useState<boolean>(true);
  const [scriptError, setScriptError] = React.useState<string>("");

  // 영문/기술 에러메시지를 한국어로 안전하게 변환하는 헬퍼
  const toFriendlyError = (msg: string): string => {
    if (!msg) return '⚠️ 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    // 백엔드에서 이미 한국어문으로 담아만 것 그대로 사용
    if (msg.startsWith('네') || msg.startsWith('⚠') || msg.startsWith('💡')) return msg;
    // 영문 에러 패턴 가드
    if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit') || msg.includes('RATE_LIMIT')) {
      return '💡 현재 AI 요청량이 많아 잠시 제한되었습니다. 1분 뒤에 다시 시도해 주세요!';
    }
    if (msg.includes('503') || msg.toLowerCase().includes('high demand') || msg.toLowerCase().includes('overload')) {
      return '💡 현재 AI 요청량이 많아 잠시 제한되었습니다. 1분 뒤에 다시 시도해 주세요!';
    }
    if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('failed')) {
      return '⚠️ 네트워크 연결에 실패했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.';
    }
    if (msg.toLowerCase().includes('not found') || msg.includes('404')) {
      return '⚠️ AI 모델을 찾을 수 없습니다. 잠시 후 다시 시도해 주세요.';
    }
    // 기타 영문 에러는 일괄 대체
    if (/[a-zA-Z]{5,}/.test(msg)) {
      return '⚠️ AI 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    }
    return msg;
  };

  const handleDownloadThumbnail = async () => {
    if (!analysisResult.thumbnail) return;
    setThumbnailProgress(true);
    try {
      const proxyUrl = `/api/download?url=${encodeURIComponent(analysisResult.thumbnail)}&filename=${encodeURIComponent(`${analysisResult.id}_thumbnail.jpg`)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("Thumbnail download failed");
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${analysisResult.id}_thumbnail.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      window.open(analysisResult.thumbnail, "_blank");
    } finally {
      setThumbnailProgress(false);
    }
  };

  const handleGenerateCaption = async () => {
    setIsGenerating(true);
    setCaptionText("");
    setCaptionError("");
    try {
      const response = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: analysisResult.title }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || data.error || "Failed to generate caption");
      }
      const text = data.caption || data.text;
      if (!text) throw new Error("No caption returned");
      setCaptionText(text);
      if (showToast) showToast("AI 바이럴 캡션이 생성되었습니다! ✨");
    } catch (err: any) {
      const friendly = toFriendlyError(err.message);
      setCaptionError(friendly);
      if (showToast) showToast(friendly);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(captionText);
      setIsCopied(true);
      if (showToast) showToast("클립보드에 복사되었습니다! 📋");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExtractScript = async () => {
    const audioUrl = analysisResult.realAudioUrl;
    if (!audioUrl) {
      const msg = "이 영상에는 분석 가능한 오디오 주소가 없습니다.";
      setScriptError(msg);
      if (showToast) showToast(msg);
      return;
    }
    setIsExtractingScript(true);
    setScriptText("");
    setScriptError("");
    setScriptExpanded(true);
    try {
      const response = await fetch("/api/extract-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl, videoTitle: analysisResult.title }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "대본 추출에 실패했습니다.");
      }
      setScriptText(data.script || "");
      if (showToast) showToast("AI 대본 추출 완료! 📜");
    } catch (err: any) {
      const friendly = toFriendlyError(err.message);
      setScriptError(friendly);
      if (showToast) showToast(friendly);
    } finally {
      setIsExtractingScript(false);
    }
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(scriptText);
      setIsScriptCopied(true);
      if (showToast) showToast("대본이 클립보드에 복사되었습니다! 📋");
      setTimeout(() => setIsScriptCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // 마크다운 텍스트를 간단하게 HTML로 렌더링하는 파서
  const renderMarkdown = (text: string) => {
    return text
      .split("\n")
      .map((line, i) => {
        // H2
        if (line.startsWith("## ")) return <h2 key={i} className="text-sm font-black text-cyan-300 mt-4 mb-2 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 shrink-0" />{line.slice(3)}</h2>;
        // H3
        if (line.startsWith("### ")) return <h3 key={i} className="text-xs font-bold text-purple-300 mt-3 mb-1.5">{line.slice(4)}</h3>;
        // H1
        if (line.startsWith("# ")) return <h1 key={i} className="text-base font-black text-white mt-4 mb-2">{line.slice(2)}</h1>;
        // 구분선
        if (line.startsWith("---") || line.startsWith("***")) return <hr key={i} className="border-zinc-700 my-3" />;
        // 인용문
        if (line.startsWith("> ")) return <blockquote key={i} className="border-l-2 border-yellow-500/60 pl-3 text-yellow-300/80 italic text-xs my-1">{line.slice(2)}</blockquote>;
        // 테이블 행
        if (line.startsWith("|") && line.endsWith("|")) {
          const cells = line.split("|").filter((c) => c.trim() !== "");
          const isSeparator = cells.every(c => /^[-:]+$/.test(c.trim()));
          if (isSeparator) return null;
          const isHeader = i > 0 ? false : true;
          return (
            <tr key={i} className="border-b border-zinc-800">
              {cells.map((cell, j) => (
                <td key={j} className="px-2.5 py-1.5 text-[11px] text-zinc-300 leading-relaxed">{cell.trim()}</td>
              ))}
            </tr>
          );
        }
        // 불릿 리스트
        if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="text-xs text-zinc-300 ml-3 list-disc leading-relaxed">{line.slice(2)}</li>;
        // 번호 리스트
        if (/^\d+\. /.test(line)) return <li key={i} className="text-xs text-zinc-300 ml-3 list-decimal leading-relaxed">{line.replace(/^\d+\. /, "")}</li>;
        // 빈 줄
        if (line.trim() === "") return <div key={i} className="h-1" />;
        // 굵은 텍스트 처리 (인라인)
        const boldProcessed = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
        // 일반 텍스트
        return <p key={i} className="text-xs text-zinc-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: boldProcessed }} />;
      })
      .filter(Boolean);
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 100 }}
      id="download-result-panel" 
      className="max-w-4xl mx-auto my-8"
    >
      <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950 border-2 border-cyan-500/20 rounded-2xl overflow-hidden shadow-2xl relative">
        
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#00f2fe]/10 rounded-full blur-xl" />
        <div className="absolute top-0 left-0 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-br-2xl border-r border-b border-cyan-400/30">
          ANALYZED SUCCESSFUL • 워터마크 없음
        </div>

        <div className="p-4 sm:p-6 md:p-8 pt-10 md:pt-12 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-xl overflow-hidden border border-zinc-800 group shadow-lg bg-black">
              <img 
                src={analysisResult.thumbnail} 
                alt="Video Thumbnail" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              
              <button 
                onClick={() => setPreviewVideo(analysisResult)}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 hover:bg-black/20 transition-colors group cursor-pointer"
                title="동영상 미리보기 재생"
              >
                <div className="w-14 h-14 rounded-full bg-cyan-400 text-zinc-950 flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all">
                  <Play className="w-7 h-7 fill-zinc-950 stroke-zinc-950 ml-1" />
                </div>
                <span className="mt-3 text-[11px] font-bold uppercase tracking-widest text-zinc-200 bg-black/60 px-2.5 py-1 rounded-full border border-zinc-700 backdrop-blur">
                  화질 테스트 플레이어
                </span>
              </button>

              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                <Video className="w-3.5 h-3.5" />
                <span>{analysisResult.resolution}</span>
              </div>
              
              <div className="absolute bottom-3 right-3 text-xs text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur font-mono">
                {analysisResult.duration}
              </div>
            </div>

            <div className="w-full max-w-[280px] mt-3.5 flex items-center justify-between text-xs text-zinc-400 px-1 font-mono">
              <span>비디오 용량: <strong>{analysisResult.fileSize}</strong></span>
              <span>포맷: <strong>MP4(MPEG-4)</strong></span>
            </div>
          </div>

          <div className="md:col-span-7 flex flex-col justify-between h-full space-y-5">
            
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <img 
                  src={analysisResult.creatorAvatar} 
                  alt="Creator avatar" 
                  className="w-8 h-8 rounded-full border border-zinc-800 object-cover" 
                />
                <div>
                  <h4 className="text-sm font-bold text-zinc-200 leading-none">{analysisResult.creatorName}</h4>
                  <span className="text-[10px] text-zinc-500">Douyin Creator ID Verified</span>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white leading-normal mb-3">
                {analysisResult.title}
              </h3>

              <div className="grid grid-cols-3 gap-2 bg-zinc-900 border border-zinc-800/60 rounded-lg p-2.5 text-center text-xs">
                <div>
                  <span className="block text-zinc-500 text-[10px]">좋아요</span>
                  <span className="font-bold text-rose-500 font-mono">{analysisResult.likes}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 text-[10px]">댓글수</span>
                  <span className="font-bold text-cyan-400 font-mono">{analysisResult.comments}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 text-[10px]">공유수</span>
                  <span className="font-bold text-purple-400 font-mono">{analysisResult.shares}</span>
                </div>
              </div>
            </div>

            {downloadProgress !== null && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                  <span className="flex items-center gap-2 font-medium">
                    <RefreshCcw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    {downloadType === "video" ? "워터마크 마스킹 제거 MP4 비디오 렌더링 중..." : "오리지널 오디오 MP3 디코딩 중..."}
                  </span>
                  <span className="font-mono font-bold text-cyan-400">{downloadProgress}%</span>
                </div>
                <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-rose-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1.5 text-right">
                  자동 다운로드 트리거 패킷이 완료되면 파일 저정 다이얼로그가 자동 실행됩니다.
                </p>
              </div>
            )}

            {downloadCompleted && (
              <motion.div 
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-xl p-3 text-xs flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>다운로드 시뮬레이션 성공!</strong> 파일이 로컬 기기로 정상 이송되었습니다. 워터마크가 완전히 소거된 무손실 최고해상도 원본 파일 형태입니다.
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">
                ⚡ Creator Toolbox (크리에이터 툴박스)
              </h5>
              
              <div className="grid grid-cols-1 gap-2.5">
                {/* 1. MP4 Video Download Button */}
                <button
                  onClick={() => triggerDownloadAction("video")}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-[#00f2fe] via-[#00c6ff] to-[#0072ff] hover:brightness-110 active:scale-[0.99] text-zinc-950 font-extrabold text-sm sm:text-base py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-cyan-950/20 cursor-pointer transition-all"
                >
                  <div className="absolute inset-0 bg-white/10 hover:bg-transparent pointer-events-none" />
                  <Video className="w-5 h-5 text-zinc-950" />
                  <span>MP4 비디오 다운로드 (워터마크 제로)</span>
                  <span className="bg-zinc-950 text-cyan-300 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase">
                    {analysisResult.fileSize}
                  </span>
                </button>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* 2. MP3 Audio Extraction Button */}
                  <button
                    onClick={() => triggerDownloadAction("audio")}
                    className="relative overflow-hidden bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-100 font-extrabold text-xs sm:text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Music className="w-4 h-4 text-[#fe0979]" />
                    <span>오디오(MP3)만 추출하기</span>
                  </button>

                  {/* 3. HD Thumbnail Download Button */}
                  <button
                    onClick={handleDownloadThumbnail}
                    disabled={thumbnailProgress}
                    className="relative overflow-hidden bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-100 font-extrabold text-xs sm:text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {thumbnailProgress ? (
                      <>
                        <RefreshCcw className="w-4 h-4 text-purple-400 animate-spin" />
                        <span>썸네일 다운로드 중...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm leading-none">🖼️</span>
                        <span>고화질 썸네일 다운로드</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI Caption Section */}
              <div className="space-y-3">
                <button
                  onClick={handleGenerateCaption}
                  disabled={isGenerating}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:brightness-110 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-indigo-950/20 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin text-white" />
                      <span>생성 중...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white animate-pulse" />
                      <span>✨ AI 바이럴 캡션 및 해시태그 생성하기</span>
                    </>
                  )}
                </button>

                {/* 캡션 인라인 에러 배너 */}
                <AnimatePresence>
                  {captionError && !captionText && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-2.5 bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300"
                    >
                      <span className="text-base leading-none shrink-0 mt-0.5">💡</span>
                      <p className="leading-relaxed">{captionError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {captionText && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-zinc-800/80 bg-zinc-900/40 rounded-xl p-4 space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                      <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        AI 추천 바이럴 카피
                      </span>
                      <button
                        onClick={handleCopyText}
                        className="p-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                        title="텍스트 복사하기"
                      >
                        {isCopied ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">복사됨</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>복사하기</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap bg-zinc-950/60 border border-zinc-850 p-3.5 rounded-lg font-sans">
                      {captionText}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* ═══ AI 대본 추출 섹션 ═══ */}
              <div className="space-y-3">
                {/* 대본 추출 버튼 */}
                <button
                  id="extract-script-btn"
                  onClick={handleExtractScript}
                  disabled={isExtractingScript || !analysisResult.realAudioUrl}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-700 hover:brightness-110 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-teal-950/20 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/5 hover:bg-transparent pointer-events-none" />
                  {isExtractingScript ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin text-white" />
                      <span>AI가 음성을 분석 중...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 text-white" />
                      <span>📝 AI 영상 대본 추출 및 요약하기</span>
                    </>
                  )}
                </button>

                {/* 대본 추출 인라인 에러 배너 */}
                <AnimatePresence>
                  {scriptError && !scriptText && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-2.5 bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300"
                    >
                      <span className="text-base leading-none shrink-0 mt-0.5">💡</span>
                      <p className="leading-relaxed">{scriptError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 로딩 중 상태 배너 */}
                <AnimatePresence>
                  {isExtractingScript && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-teal-950/40 border border-teal-500/30 rounded-xl p-4 flex flex-col items-center gap-3">
                        {/* 파형 애니메이션 */}
                        <div className="flex items-end gap-0.5 h-8">
                          {[0.4, 0.7, 1, 0.8, 0.5, 0.9, 0.6, 1, 0.7, 0.4, 0.8, 0.5].map((h, i) => (
                            <div
                              key={i}
                              className="w-1 bg-gradient-to-t from-teal-500 to-cyan-300 rounded-full animate-pulse"
                              style={{
                                height: `${h * 100}%`,
                                animationDelay: `${i * 80}ms`,
                                animationDuration: `${600 + i * 50}ms`,
                              }}
                            />
                          ))}
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-teal-300">AI가 영상의 음성을 분석하고 번역하는 중입니다...</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">약 10~20초 소요됩니다. 잠시만 기다려 주세요 ☕</p>
                        </div>
                        <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full animate-[shimmer_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 대본 결과 마크다운 뷰어 */}
                <AnimatePresence>
                  {scriptText && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="border border-teal-500/25 bg-gradient-to-b from-teal-950/20 to-zinc-950/40 rounded-xl overflow-hidden"
                    >
                      {/* 헤더 바 */}
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-teal-500/20 bg-teal-950/30">
                        <span className="text-xs font-black text-teal-300 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                          📜 AI 번역 대본 & 마케팅 요약본
                        </span>
                        <div className="flex items-center gap-1.5">
                          {/* 복사 버튼 */}
                          <button
                            onClick={handleCopyScript}
                            className="p-1.5 px-2.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-[11px] font-bold"
                          >
                            {isScriptCopied ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">복사됨</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>복사하기</span>
                              </>
                            )}
                          </button>
                          {/* 접기/펼치기 버튼 */}
                          <button
                            onClick={() => setScriptExpanded(p => !p)}
                            className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer"
                          >
                            {scriptExpanded
                              ? <ChevronUp className="w-3.5 h-3.5" />
                              : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* 본문 마크다운 렌더러 */}
                      <AnimatePresence>
                        {scriptExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 space-y-0.5 max-h-[480px] overflow-y-auto custom-scrollbar">
                              {/* 테이블 행 모아서 table 태그로 감싸기 */}
                              {(() => {
                                const lines = scriptText.split("\n");
                                const elements: React.ReactNode[] = [];
                                let tableRows: React.ReactNode[] = [];
                                let tableHeaderParsed = false;

                                const flushTable = (key: string) => {
                                  if (tableRows.length > 0) {
                                    elements.push(
                                      <div key={`tbl-${key}`} className="overflow-x-auto my-3 rounded-lg border border-zinc-800">
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
                                        <tr key={i} className="bg-teal-950/40 border-b border-zinc-700">
                                          {cells.map((c, j) => (
                                            <th key={j} className="px-3 py-2 text-[11px] font-black text-teal-300 whitespace-nowrap">{c.trim()}</th>
                                          ))}
                                        </tr>
                                      );
                                      tableHeaderParsed = true;
                                    } else {
                                      tableRows.push(
                                        <tr key={i} className="border-b border-zinc-800/60 hover:bg-teal-950/10 transition-colors">
                                          {cells.map((c, j) => (
                                            <td key={j} className="px-3 py-2 text-[11px] text-zinc-300 leading-relaxed">{c.trim()}</td>
                                          ))}
                                        </tr>
                                      );
                                    }
                                  } else if (isSeparator) {
                                    // 구분자 행 무시
                                  } else {
                                    flushTable(String(i));
                                    // 일반 마크다운 렌더링
                                    if (line.startsWith("## ")) {
                                      elements.push(<h2 key={i} className="text-sm font-black text-cyan-300 mt-5 mb-2 flex items-center gap-1.5 border-b border-cyan-500/20 pb-1.5"><BookOpen className="w-3.5 h-3.5 shrink-0" />{line.slice(3)}</h2>);
                                    } else if (line.startsWith("### ")) {
                                      elements.push(<h3 key={i} className="text-xs font-bold text-teal-300 mt-3 mb-1.5">{line.slice(4)}</h3>);
                                    } else if (line.startsWith("# ")) {
                                      elements.push(<h1 key={i} className="text-base font-black text-white mt-4 mb-2">{line.slice(2)}</h1>);
                                    } else if (line.startsWith("> ")) {
                                      elements.push(<blockquote key={i} className="border-l-2 border-yellow-500/60 pl-3 text-yellow-300/80 italic text-xs my-1.5">{line.slice(2)}</blockquote>);
                                    } else if (line.startsWith("---")) {
                                      elements.push(<hr key={i} className="border-zinc-700/60 my-3" />);
                                    } else if (line.startsWith("- ") || line.startsWith("* ")) {
                                      elements.push(<li key={i} className="text-xs text-zinc-300 ml-4 list-disc leading-relaxed">{line.slice(2)}</li>);
                                    } else if (/^\d+\.\s/.test(line)) {
                                      elements.push(<li key={i} className="text-xs text-zinc-300 ml-4 list-decimal leading-relaxed">{line.replace(/^\d+\.\s/, "")}</li>);
                                    } else if (line.trim() === "") {
                                      elements.push(<div key={i} className="h-1.5" />);
                                    } else {
                                      const html = line
                                        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
                                        .replace(/`(.+?)`/g, '<code class="bg-zinc-800 text-cyan-300 px-1 py-0.5 rounded text-[10px] font-mono">$1</code>');
                                      elements.push(<p key={i} className="text-xs text-zinc-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />);
                                    }
                                  }
                                });
                                flushTable("end");
                                return elements;
                              })()}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Reset/New analysis button */}
              <button
                onClick={handleReset}
                className="w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>다른 동영상 링크 분석하기</span>
              </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-3 text-[11px] text-zinc-500 leading-relaxed">
              💡 <strong>알림:</strong> Douyin(抖音)의 고화질 원본 비디오 파일은 해외 CDN 가속 망에 직접 업 링크되어 다운로드 속도가 대폭 향상되었습니다. 오프라인 상태에서도 언제든지 비디오 미리보기 재생이 가능합니다.
            </div>

          </div>
        </div>
      </div>
      
      {/* Result Banner Slot */}
      <div className="mt-6 w-full max-w-4xl mx-auto">
        <CPABanner ad={CPA_ADS.download_result} type="horizontal" />
      </div>
    </motion.section>
  );
}

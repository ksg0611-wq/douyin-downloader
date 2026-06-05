import React from "react";
import { motion } from "motion/react";
import { Video, Play, Download, Music, RefreshCcw, CheckCircle2, Image as ImageIcon, Sparkles, Copy, Check } from "lucide-react";
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
      if (!text) {
        throw new Error("No caption returned");
      }
      setCaptionText(text);
      if (showToast) {
        showToast("AI 바이럴 캡션이 생성되었습니다! ✨");
      }
    } catch (err: any) {
      console.error(err);
      if (showToast) {
        showToast("잠시 후 다시 시도해 주세요.");
      } else {
        alert("잠시 후 다시 시도해 주세요.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(captionText);
      setIsCopied(true);
      if (showToast) {
        showToast("클립보드에 복사되었습니다! 📋");
      }
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
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

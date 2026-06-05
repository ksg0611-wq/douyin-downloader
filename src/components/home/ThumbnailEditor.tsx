"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Download,
  Palette,
  Type,
  RefreshCcw,
  ChevronUp,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

// ── 타입 정의 ──
interface ThumbnailEditorProps {
  thumbnailUrl: string;
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

type FontSize = "소" | "중" | "대" | "특대";
type BgStyle = "black" | "yellow" | "red" | "blue" | "white" | "none";
type TextAlign = "left" | "center" | "right";
type Position = "top" | "middle" | "bottom";

// ── 스타일 설정 맵 ──
const BG_CONFIGS: Record<BgStyle, { bg: string; text: string; label: string; emoji: string }> = {
  black:  { bg: "rgba(0,0,0,0.82)",     text: "#ffffff", label: "블랙",  emoji: "⬛" },
  yellow: { bg: "rgba(255,210,0,0.92)",  text: "#111111", label: "옐로우", emoji: "🟨" },
  red:    { bg: "rgba(220,38,38,0.90)",  text: "#ffffff", label: "레드",  emoji: "🟥" },
  blue:   { bg: "rgba(37,99,235,0.90)",  text: "#ffffff", label: "블루",  emoji: "🟦" },
  white:  { bg: "rgba(255,255,255,0.90)", text: "#111111", label: "화이트", emoji: "⬜" },
  none:   { bg: "transparent",           text: "#ffffff", label: "없음",  emoji: "🚫" },
};

const FONT_SIZES: Record<FontSize, { label: string; canvasSize: number }> = {
  소:   { label: "소(S)",  canvasSize: 32 },
  중:   { label: "중(M)",  canvasSize: 48 },
  대:   { label: "대(L)",  canvasSize: 64 },
  특대: { label: "특대(XL)", canvasSize: 82 },
};

const POSITIONS: Record<Position, string> = {
  top:    "상단",
  middle: "중앙",
  bottom: "하단",
};

// ── 이미지 Cross-origin 프록시 로드 ──
async function loadImageFromProxy(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    // 프록시 경유
    const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=thumb.jpg`;
    img.onload = () => resolve(img);
    img.onerror = () => {
      // 직접 시도 (fallback)
      const img2 = new Image();
      img2.crossOrigin = "anonymous";
      img2.onload = () => resolve(img2);
      img2.onerror = reject;
      img2.src = url;
    };
    img.src = proxyUrl;
  });
}

export default function ThumbnailEditor({
  thumbnailUrl,
  videoId,
  isOpen,
  onClose,
}: ThumbnailEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captionText, setCaptionText] = React.useState("단 3분 완성! 🔥");
  const [bgStyle, setBgStyle] = React.useState<BgStyle>("black");
  const [fontSize, setFontSize] = React.useState<FontSize>("중");
  const [position, setPosition] = React.useState<Position>("bottom");
  const [textAlign, setTextAlign] = React.useState<TextAlign>("center");
  const [loadedImage, setLoadedImage] = React.useState<HTMLImageElement | null>(null);
  const [isImageLoading, setIsImageLoading] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  // ── 이미지 로드 ──
  useEffect(() => {
    if (!isOpen || !thumbnailUrl) return;
    setIsImageLoading(true);
    setImageError(false);
    setLoadedImage(null);
    loadImageFromProxy(thumbnailUrl)
      .then((img) => {
        setLoadedImage(img);
        setIsImageLoading(false);
      })
      .catch(() => {
        setImageError(true);
        setIsImageLoading(false);
      });
  }, [isOpen, thumbnailUrl]);

  // ── Canvas 렌더링 ──
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 9:16 비율 (숏폼 표준)
    const W = 720;
    const H = 1280;
    canvas.width = W;
    canvas.height = H;

    // 1) 배경 이미지 (object-fit: cover 방식)
    const imgAspect = loadedImage.width / loadedImage.height;
    const canvasAspect = W / H;
    let sx = 0, sy = 0, sw = loadedImage.width, sh = loadedImage.height;
    if (imgAspect > canvasAspect) {
      sw = loadedImage.height * canvasAspect;
      sx = (loadedImage.width - sw) / 2;
    } else {
      sh = loadedImage.width / canvasAspect;
      sy = (loadedImage.height - sh) / 2;
    }
    ctx.drawImage(loadedImage, sx, sy, sw, sh, 0, 0, W, H);

    // 2) 텍스트 없으면 종료
    if (!captionText.trim()) return;

    const text = captionText.trim();
    const cfg = BG_CONFIGS[bgStyle];
    const basePx = FONT_SIZES[fontSize].canvasSize;

    // 3) 폰트 설정 (시스템 폰트 스택)
    ctx.font = `900 ${basePx}px "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif`;
    ctx.textBaseline = "middle";
    ctx.textAlign = textAlign;

    // 4) 텍스트 줄바꿈 (최대 너비 660px)
    const maxWidth = W - 60;
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    // 5) 각 줄 높이 계산
    const lineH = basePx * 1.4;
    const padV = basePx * 0.55;
    const padH = 30;
    const totalH = lines.length * lineH + padV * 2;

    // 6) Y 위치 결정
    let boxY: number;
    if (position === "top") boxY = 60;
    else if (position === "middle") boxY = (H - totalH) / 2;
    else boxY = H - totalH - 60;

    // 7) 배경 박스 그리기
    if (cfg.bg !== "transparent") {
      const boxW = (() => {
        // 각 줄 너비 중 최대값
        let max = 0;
        for (const l of lines) {
          const m = ctx.measureText(l).width;
          if (m > max) max = m;
        }
        return Math.min(max + padH * 2, W - 20);
      })();

      let boxX: number;
      if (textAlign === "left") boxX = 30;
      else if (textAlign === "right") boxX = W - boxW - 30;
      else boxX = (W - boxW) / 2;

      // 둥근 모서리 박스
      const r = 14;
      ctx.beginPath();
      ctx.moveTo(boxX + r, boxY);
      ctx.lineTo(boxX + boxW - r, boxY);
      ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + r);
      ctx.lineTo(boxX + boxW, boxY + totalH - r);
      ctx.quadraticCurveTo(boxX + boxW, boxY + totalH, boxX + boxW - r, boxY + totalH);
      ctx.lineTo(boxX + r, boxY + totalH);
      ctx.quadraticCurveTo(boxX, boxY + totalH, boxX, boxY + totalH - r);
      ctx.lineTo(boxX, boxY + r);
      ctx.quadraticCurveTo(boxX, boxY, boxX + r, boxY);
      ctx.closePath();
      ctx.fillStyle = cfg.bg;
      ctx.fill();
    }

    // 8) 텍스트 X 좌표
    let textX: number;
    if (textAlign === "left") textX = 30 + padH;
    else if (textAlign === "right") textX = W - 30 - padH;
    else textX = W / 2;

    // 9) 텍스트 그림자 + 텍스트 렌더링
    if (cfg.bg === "transparent") {
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    } else {
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = cfg.text;
    lines.forEach((line, i) => {
      const lineY = boxY + padV + lineH * i + lineH / 2;
      ctx.fillText(line, textX, lineY);
    });

    // 그림자 리셋
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // 10) 워터마크 (우하단 소형)
    ctx.font = `bold 20px "Apple SD Gothic Neo", sans-serif`;
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillText("douyin-dl.com", W - 20, H - 20);
  }, [loadedImage, captionText, bgStyle, fontSize, position, textAlign]);

  // 파라미터 변경 시 리드로우
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // ── 다운로드 ──
  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDownloading(true);
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("blob failed"))),
          "image/png",
          0.97
        );
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${videoId}_cover_edited.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("다운로드에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 pointer-events-none"
          >
            <div
              className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto max-h-[95vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center">
                    <Palette className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">🎨 썸네일 커버 에디터</h3>
                    <p className="text-[10px] text-zinc-500">HTML5 Canvas · 클라이언트 사이드 렌더링</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 본문 - 스크롤 가능 */}
              <div className="overflow-y-auto flex-grow">
                <div className="flex flex-col lg:flex-row gap-0 lg:gap-0">

                  {/* ── 왼쪽: 캔버스 미리보기 ── */}
                  <div className="lg:w-[45%] bg-zinc-900/40 flex items-center justify-center p-5 border-b lg:border-b-0 lg:border-r border-zinc-800 shrink-0">
                    <div className="w-full max-w-[220px] sm:max-w-[260px] mx-auto">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center mb-3">
                        실시간 미리보기
                      </p>
                      <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden border border-zinc-700 shadow-xl bg-zinc-800">
                        {isImageLoading && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                            <RefreshCcw className="w-6 h-6 text-zinc-500 animate-spin" />
                            <span className="text-xs text-zinc-500">이미지 로딩 중...</span>
                          </div>
                        )}
                        {imageError && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                            <span className="text-2xl">🖼️</span>
                            <p className="text-xs text-zinc-500 text-center">
                              이미지를 불러올 수 없습니다.
                              <br />
                              텍스트 합성은 가능합니다.
                            </p>
                          </div>
                        )}
                        <canvas
                          ref={canvasRef}
                          className="w-full h-full object-contain"
                          style={{ display: loadedImage ? "block" : "none" }}
                        />
                      </div>
                      <p className="text-[10px] text-zinc-600 text-center mt-2">
                        최종 출력: 720 × 1280px (9:16)
                      </p>
                    </div>
                  </div>

                  {/* ── 오른쪽: 편집 컨트롤 ── */}
                  <div className="lg:w-[55%] p-5 space-y-5">

                    {/* 텍스트 입력 */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-black text-zinc-300 uppercase tracking-wider mb-2">
                        <Type className="w-3.5 h-3.5 text-cyan-400" />
                        메인 카피 텍스트
                      </label>
                      <textarea
                        value={captionText}
                        onChange={(e) => setCaptionText(e.target.value)}
                        placeholder="썸네일에 넣을 문구를 입력하세요 (예: 단 3분 완성! 🔥)"
                        rows={3}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/60 resize-none font-sans leading-relaxed transition-colors"
                      />
                    </div>

                    {/* 배경 스타일 */}
                    <div>
                      <label className="text-xs font-black text-zinc-300 uppercase tracking-wider mb-2.5 block">
                        자막 배경 색상
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(Object.entries(BG_CONFIGS) as [BgStyle, typeof BG_CONFIGS[BgStyle]][]).map(([key, cfg]) => (
                          <button
                            key={key}
                            onClick={() => setBgStyle(key)}
                            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              bgStyle === key
                                ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-300 shadow-sm shadow-cyan-500/10"
                                : "border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                            }`}
                          >
                            <span>{cfg.emoji}</span>
                            <span>{cfg.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 폰트 크기 */}
                    <div>
                      <label className="text-xs font-black text-zinc-300 uppercase tracking-wider mb-2.5 block">
                        글자 크기
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {(Object.entries(FONT_SIZES) as [FontSize, typeof FONT_SIZES[FontSize]][]).map(([key, cfg]) => (
                          <button
                            key={key}
                            onClick={() => setFontSize(key)}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              fontSize === key
                                ? "border-purple-400/60 bg-purple-400/10 text-purple-300"
                                : "border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                            }`}
                          >
                            {cfg.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 텍스트 정렬 */}
                    <div>
                      <label className="text-xs font-black text-zinc-300 uppercase tracking-wider mb-2.5 block">
                        텍스트 정렬
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {([["left", "좌측", AlignLeft], ["center", "중앙", AlignCenter], ["right", "우측", AlignRight]] as const).map(
                          ([val, label, Icon]) => (
                            <button
                              key={val}
                              onClick={() => setTextAlign(val)}
                              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                textAlign === val
                                  ? "border-rose-400/60 bg-rose-400/10 text-rose-300"
                                  : "border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {label}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* 자막 위치 */}
                    <div>
                      <label className="text-xs font-black text-zinc-300 uppercase tracking-wider mb-2.5 block">
                        자막 위치
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(Object.entries(POSITIONS) as [Position, string][]).map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => setPosition(key)}
                            className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              position === key
                                ? "border-amber-400/60 bg-amber-400/10 text-amber-300"
                                : "border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                            }`}
                          >
                            {key === "top" && <ChevronUp className="w-3.5 h-3.5" />}
                            {key === "middle" && <span className="text-[10px] font-black">━</span>}
                            {key === "bottom" && <ChevronDown className="w-3.5 h-3.5" />}
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 하단 버튼 영역 (고정) */}
              <div className="shrink-0 px-5 py-4 border-t border-zinc-800 bg-zinc-900/40 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={onClose}
                  className="sm:w-1/3 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  닫기
                </button>
                <button
                  id="thumbnail-editor-download-btn"
                  onClick={handleDownload}
                  disabled={isDownloading || !loadedImage}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:brightness-110 active:scale-[0.99] text-white font-extrabold text-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-rose-950/30"
                >
                  {isDownloading ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                      <span>저장 중...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>📥 완성된 커버 다운로드 (PNG)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

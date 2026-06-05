"use client";

import React, { useState, useRef } from "react";
import { 
  Upload, 
  Smartphone, 
  Trash2, 
  Layers, 
  Info, 
  Image as ImageIcon,
  Sliders,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type PlatformType = "tiktok" | "shorts" | "reels" | "douyin";

interface PlatformConfig {
  key: PlatformType;
  name: string;
  color: string;
  description: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    key: "tiktok",
    name: "TikTok (틱톡)",
    color: "from-[#00f2fe] to-[#fe0979]",
    description: "글로벌 틱톡 UI 가이드라인. 우측 하단의 풍성한 아이콘 바와 좌측 하단 캡션이 특징입니다.",
  },
  {
    key: "shorts",
    name: "YouTube Shorts (쇼츠)",
    color: "from-red-600 to-red-500",
    description: "유튜브 쇼츠 UI 가이드라인. 우측 아이콘 바가 아래로 더 쏠려 있으며, 채널 구독 영역이 큽니다.",
  },
  {
    key: "reels",
    name: "Instagram Reels (릴스)",
    color: "from-[#f92c8b] to-[#b02cd4]",
    description: "인스타그램 릴스 UI 가이드라인. 하단 탭 바가 스마트폰 맨 밑 영역을 일부 차지합니다.",
  },
  {
    key: "douyin",
    name: "Douyin (도우인)",
    color: "from-cyan-500 via-purple-500 to-rose-500",
    description: "중국 도우인 UI 가이드라인. 틱톡과 유사하나 쇼핑 카트 배너나 상세 링크 영역이 가려짐을 유발합니다.",
  }
];

// 기본 샘플 이미지 (아름다운 9:16 CSS 그라데이션 카드 형태)
const DEFAULT_SAMPLE_BG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1080' height='1920' viewBox='0 0 1080 1920'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%231f1c2c'/><stop offset='50%25' stop-color='%23928dab'/><stop offset='100%25' stop-color='%23fe0979'/></linearGradient></defs><rect width='1080' height='1920' fill='url(%23g)'/><circle cx='540' cy='600' r='200' fill='white' opacity='0.08'/><line x1='100' y1='960' x2='980' y2='960' stroke='white' stroke-width='4' opacity='0.2'/><text x='540' y='900' fill='white' font-size='64' font-weight='bold' font-family='sans-serif' text-anchor='middle' opacity='0.8'>SHORTSPACK PRO</text><text x='540' y='1050' fill='white' font-size='38' font-family='sans-serif' text-anchor='middle' opacity='0.6'>안전 영역 테스트용 샘플 배경</text><text x='540' y='1120' fill='%2300f2fe' font-size='30' font-weight='bold' font-family='sans-serif' text-anchor='middle' opacity='0.9'>중요한 자막과 로고는 여기에 배치하세요!</text></svg>";

interface SafeZonePreviewerProps {
  lang?: "ko" | "en";
}

export default function SafeZonePreviewer({ lang = "ko" }: SafeZonePreviewerProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>("tiktok");
  const [previewImage, setPreviewImage] = useState<string>(DEFAULT_SAMPLE_BG);
  const [opacity, setOpacity] = useState<number>(75); // 0 ~ 100
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  const loadImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  const handleReset = () => {
    setPreviewImage(DEFAULT_SAMPLE_BG);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const activeConfig = PLATFORMS.find(p => p.key === selectedPlatform) || PLATFORMS[0];

  return (
    <div id="safe-zone-previewer" className="w-full max-w-4xl mx-auto">
      {/* 타이틀 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#fe0979] to-[#00f2fe] flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            📱 숏폼 안전 영역 (Safe Zone) 프리뷰어
            <span className="bg-gradient-to-r from-rose-500 to-cyan-400 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              NEW
            </span>
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            제작하신 썸네일이나 영상을 올려 각 플랫폼의 가려짐 UI(좋아요, 캡션 등) 세이프존 영역을 직접 확인하세요.
          </p>
        </div>
      </div>

      {/* 메인 스플릿 뷰 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* LEFT: 컨트롤 패널 */}
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-6">
            
            {/* 1. 이미지 업로드 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider block">
                1. 테스트 이미지 선택
              </label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 ${
                  isDragOver 
                    ? "border-rose-500 bg-rose-50/20 dark:bg-rose-950/10" 
                    : "border-zinc-250 hover:border-zinc-350 dark:border-zinc-800 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                  <Upload className="w-5 h-5" />
                </div>
                
                <div className="text-center">
                  <p className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    클릭하거나 이미지를 여기에 끌어다 놓으세요
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-1">
                    PNG, JPG, WEBP 지원 (서버 저장 없이 즉시 미리보기)
                  </p>
                </div>
              </div>

              {previewImage !== DEFAULT_SAMPLE_BG && (
                <div className="flex justify-end">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>기본 샘플 이미지로 되돌리기</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. 플랫폼 선택 */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider block">
                2. 숏폼 플랫폼 선택
              </label>

              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((plat) => (
                  <button
                    key={plat.key}
                    onClick={() => setSelectedPlatform(plat.key)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      selectedPlatform === plat.key
                        ? "bg-zinc-950 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-950 shadow-sm"
                        : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${plat.color}`} />
                    <span>{plat.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-900 rounded-xl text-[11px] text-zinc-650 dark:text-zinc-400 leading-relaxed flex gap-2">
                <Info className="w-4 h-4 text-zinc-450 dark:text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">설명:</span> {activeConfig.description}
                </div>
              </div>
            </div>

            {/* 3. 투명도 조절 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider">
                <span>3. 가이드 오버레이 투명도</span>
                <span className="font-mono text-zinc-600 dark:text-zinc-400">{opacity}%</span>
              </div>

              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 leading-normal">
                슬라이더 값을 조작하여 UI 박스 뒤에 숨은 자막이나 핵심 로고의 정렬 위치를 유동적으로 겹쳐볼 수 있습니다.
              </p>
            </div>

          </div>

          {/* 안전 영역 마케팅 정보 배너 */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/60 rounded-2xl text-xs text-emerald-800 dark:text-emerald-400 leading-relaxed space-y-1">
            <h4 className="font-extrabold flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              글로벌 알고리즘 최적화 팁
            </h4>
            <p className="text-zinc-700 dark:text-zinc-400">
              틱톡, 유튜브 쇼츠 등 알고리즘 엔진은 시각 정보 분석 시 <strong>주요 자막이나 핵심 피사체가 UI 오버레이에 가려진 비디오</strong>의 유저 체류 시간(Watch Time)이 하락한다고 보고하며, 이로 인해 피드 노출량을 제한할 확률이 커집니다. 자막과 중요 로고는 반드시 아래 모바일 프리뷰의 빈 공간(Safe Zone)에 정확히 마운트되도록 조정하십시오.
            </p>
          </div>
        </div>

        {/* RIGHT: 모바일 프리뷰 화면 */}
        <div className="flex flex-col items-center">
          
          {/* 스마트폰 목업 프레임 */}
          <div className="relative w-full max-w-[320px] aspect-[9/16] bg-zinc-950 rounded-[40px] p-2.5 shadow-2xl border-4 border-zinc-800 ring-12 ring-zinc-900 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950 overflow-hidden group select-none">
            
            {/* Notch / Dynamic Island */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 ml-auto mr-3" />
            </div>

            {/* Inner Screen Container */}
            <div className="relative w-full h-full rounded-[30px] overflow-hidden bg-zinc-900">
              
              {/* 업로드된 이미지 배경 */}
              <img
                src={previewImage}
                alt="Safe Zone Preview"
                className="w-full h-full object-cover pointer-events-none"
              />

              {/* 가려짐 가이드라인 오버레이 (반투명 빨간색 가이드) */}
              <div 
                className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-200"
                style={{ opacity: opacity / 100 }}
              >
                {/* 1. 상단 UI 오버레이 (네비게이션 탭 영역) */}
                <div className="absolute top-0 inset-x-0 h-[10%] bg-red-600/15 border-b border-red-500/20 flex items-end justify-center pb-2">
                  <span className="text-[9px] font-bold text-red-550 dark:text-red-400 bg-black/60 px-2 py-0.5 rounded-full">
                    상단 가려짐 (카테고리/검색/로고)
                  </span>
                </div>

                {/* 2. 우측 아이콘 바 영역 (좋아요, 댓글, 공유 등) */}
                {selectedPlatform === "tiktok" && (
                  <div className="absolute right-0 bottom-[12%] w-[18%] h-[50%] bg-red-600/15 border-l border-red-500/20 flex flex-col items-center justify-center gap-4 py-4">
                    <div className="w-7 h-7 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[7px] text-white font-bold">프로필</div>
                    <div className="w-6 h-6 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[7px] text-white font-bold">❤️</div>
                    <div className="w-6 h-6 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[7px] text-white font-bold">💬</div>
                    <div className="w-6 h-6 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[7px] text-white font-bold">⭐</div>
                    <div className="w-6 h-6 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[7px] text-white font-bold">➡️</div>
                    <div className="w-6 h-6 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[6px] text-white font-bold animate-spin-slow">CD</div>
                  </div>
                )}

                {selectedPlatform === "shorts" && (
                  <div className="absolute right-0 bottom-[10%] w-[16%] h-[55%] bg-red-600/15 border-l border-red-500/20 flex flex-col items-center justify-end gap-5 pb-6">
                    <div className="w-6.5 h-6.5 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[6px] text-white font-bold">좋아요</div>
                    <div className="w-6.5 h-6.5 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[6px] text-white font-bold">싫어요</div>
                    <div className="w-6.5 h-6.5 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[6px] text-white font-bold">댓글</div>
                    <div className="w-6.5 h-6.5 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[6px] text-white font-bold">공유</div>
                    <div className="w-6.5 h-6.5 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[6px] text-white font-bold">리믹스</div>
                    <div className="w-6 h-6 rounded-lg bg-red-500/50 border border-red-400 flex items-center justify-center text-[5px] text-white font-bold">음악</div>
                  </div>
                )}

                {selectedPlatform === "reels" && (
                  <div className="absolute right-0 bottom-[14%] w-[16%] h-[42%] bg-red-600/15 border-l border-red-500/20 flex flex-col items-center justify-center gap-4.5 py-2">
                    <div className="w-6.5 h-6.5 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[6px] text-white font-bold">❤️</div>
                    <div className="w-6.5 h-6.5 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[6px] text-white font-bold">💬</div>
                    <div className="w-6.5 h-6.5 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[6px] text-white font-bold">DM</div>
                    <div className="w-5 h-5 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[5px] text-white font-bold">●●●</div>
                    <div className="w-6 h-6 rounded-lg bg-red-500/50 border border-red-400 flex items-center justify-center text-[5px] text-white font-bold">음악</div>
                  </div>
                )}

                {selectedPlatform === "douyin" && (
                  <div className="absolute right-0 bottom-[12%] w-[18%] h-[53%] bg-red-600/15 border-l border-red-500/20 flex flex-col items-center justify-center gap-3.5 py-3">
                    <div className="w-7 h-7 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[6px] text-white font-bold">头像</div>
                    <div className="w-6.5 h-6.5 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[6px] text-white font-bold">🧡</div>
                    <div className="w-6.5 h-6.5 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[6px] text-white font-bold">💬</div>
                    <div className="w-6.5 h-6.5 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[6px] text-white font-bold">⭐</div>
                    <div className="w-6.5 h-6.5 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[6px] text-white font-bold">分享</div>
                    <div className="w-6 h-6 rounded-md bg-red-500/30 border border-red-400 flex items-center justify-center text-[5px] font-bold text-yellow-300">团购</div>
                    <div className="w-6.5 h-6.5 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center text-[5px] text-white font-bold animate-spin-slow">CD</div>
                  </div>
                )}

                {/* 3. 좌측 하단 정보 영역 (설명글, 닉네임, 음악 정보 등) */}
                {selectedPlatform === "tiktok" && (
                  <div className="absolute left-0 bottom-[4%] w-[82%] h-[25%] bg-red-600/15 border-t border-r border-red-500/20 flex flex-col justify-end p-2.5 space-y-1">
                    <span className="text-[9px] font-bold text-red-550 dark:text-red-400 bg-black/50 px-1.5 py-0.5 rounded w-max">
                      좌측 하단 텍스트 정보 가려짐
                    </span>
                    <div className="w-20 h-3 bg-red-500/40 rounded" />
                    <div className="w-full h-8 bg-red-500/30 rounded" />
                    <div className="w-24 h-3 bg-red-500/40 rounded" />
                  </div>
                )}

                {selectedPlatform === "shorts" && (
                  <div className="absolute left-0 bottom-[4%] w-[84%] h-[28%] bg-red-600/15 border-t border-r border-red-500/20 flex flex-col justify-end p-2.5 space-y-1.5">
                    <span className="text-[9px] font-bold text-red-550 dark:text-red-400 bg-black/50 px-1.5 py-0.5 rounded w-max">
                      하단 채널 구독 및 설명글 가려짐
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-red-500/40" />
                      <div className="w-16 h-3.5 bg-red-500/40 rounded" />
                      <div className="w-10 h-3.5 bg-red-600/60 rounded" />
                    </div>
                    <div className="w-full h-6 bg-red-500/30 rounded" />
                    <div className="w-20 h-3 bg-red-500/40 rounded" />
                  </div>
                )}

                {selectedPlatform === "reels" && (
                  <div className="absolute left-0 bottom-[7%] w-[84%] h-[25%] bg-red-600/15 border-t border-r border-red-500/20 flex flex-col justify-end p-2.5 space-y-1">
                    <span className="text-[9px] font-bold text-red-550 dark:text-red-400 bg-black/50 px-1.5 py-0.5 rounded w-max">
                      하단 정보 및 오디오 텍스트 가려짐
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-red-500/40" />
                      <div className="w-20 h-3 bg-red-500/40 rounded" />
                    </div>
                    <div className="w-full h-8 bg-red-500/30 rounded" />
                    <div className="w-24 h-3 bg-red-500/40 rounded" />
                  </div>
                )}

                {selectedPlatform === "douyin" && (
                  <div className="absolute left-0 bottom-[4%] w-[82%] h-[32%] bg-red-600/15 border-t border-r border-red-500/20 flex flex-col justify-end p-2.5 space-y-1.5">
                    <span className="text-[9px] font-bold text-red-550 dark:text-red-400 bg-black/50 px-1.5 py-0.5 rounded w-max">
                      하단 캡션 및 상세 링크 가려짐
                    </span>
                    <div className="w-full h-4 bg-yellow-500/30 border border-yellow-500/30 rounded text-[7px] text-yellow-300 flex items-center px-1 font-bold">🛒 연동 상품 및 링크 영역 (가장 많이 가림)</div>
                    <div className="w-20 h-3.5 bg-red-500/40 rounded" />
                    <div className="w-full h-10 bg-red-500/30 rounded" />
                    <div className="w-24 h-3 bg-red-500/40 rounded" />
                  </div>
                )}

                {/* 4. 최하단 인풋 바 / 재생 바 가이드 영역 */}
                <div className={`absolute bottom-0 inset-x-0 bg-red-600/20 border-t border-red-500/20 flex items-center justify-center ${
                  selectedPlatform === "reels" ? "h-[7%]" : "h-[4%]"
                }`}>
                  <span className="text-[7.5px] font-bold text-red-400 bg-black/75 px-1 rounded-full scale-90">
                    {selectedPlatform === "reels" ? "릴스 하단 내비게이션 바 (전체 가려짐)" : "타임라인 재생 바 가림"}
                  </span>
                </div>

              </div>

              {/* UI 시뮬레이션 오버레이 (실제 아이콘 및 텍스트 흉내내어 더 실감나게 표현) */}
              <div className="absolute inset-0 z-20 pointer-events-none select-none flex flex-col justify-between p-3.5">
                {/* Top header */}
                <div className="flex justify-between items-center w-full pt-4">
                  <span className="text-[10px] text-white/70 font-semibold font-mono">9:41</span>
                  {selectedPlatform !== "shorts" && (
                    <div className="flex gap-4 text-xs font-bold text-white/60 mx-auto">
                      <span className="hover:text-white transition-colors cursor-pointer">팔로잉</span>
                      <span className="text-white border-b-2 border-white pb-0.5">추천</span>
                    </div>
                  )}
                  <span className="text-xs text-white/80">🔍</span>
                </div>

                {/* Bottom contents */}
                <div className="flex justify-between items-end w-full">
                  
                  {/* Left Side: Creator details */}
                  <div className="text-white space-y-1.5 max-w-[75%] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold hover:underline cursor-pointer">
                        {selectedPlatform === "douyin" ? "@抖音创作者_Pro" : "@creator_shortspack"}
                      </span>
                      {selectedPlatform === "shorts" && (
                        <button className="bg-white text-zinc-950 font-black text-[9px] px-2.5 py-0.5 rounded-full">구독</button>
                      )}
                      {selectedPlatform === "reels" && (
                        <span className="text-[9px] font-bold border border-white/30 px-1.5 py-0.2 rounded">팔로우</span>
                      )}
                    </div>
                    
                    <p className="text-[10px] text-white/90 leading-relaxed line-clamp-2">
                      {lang === "ko" 
                        ? "이 비디오는 숏폼 안전 영역 테스트 가이드 영상입니다. 중요한 로고나 텍스트가 붉은색 영역에 겹치지 않게 조절하세요! #숏폼 #꿀팁 #정보" 
                        : "Testing safe zone overlays. Avoid placing crucial text inside red transparent boxes! #shortform #safezone #creator"}
                    </p>
                    
                    <div className="flex items-center gap-1.5 text-[8.5px] text-white/70">
                      <span>🎵</span>
                      <span className="truncate max-w-[120px]">
                        {lang === "ko" ? "오리지널 사운드 track - ShortsPack" : "Original Sound track - ShortsPack"}
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Action buttons */}
                  <div className="flex flex-col items-center gap-3.5 pb-2">
                    
                    {/* Creator Avatar (For non-shorts) */}
                    {selectedPlatform !== "shorts" && (
                      <div className="relative w-8 h-8 rounded-full border border-white bg-zinc-800 flex items-center justify-center text-xs shadow-lg">
                        👤
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-rose-500 text-[8px] text-white rounded-full w-3 h-3 flex items-center justify-center font-bold font-mono">+</span>
                      </div>
                    )}

                    {/* Like button */}
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center text-sm shadow-md">
                        {selectedPlatform === "douyin" ? "🧡" : "❤️"}
                      </div>
                      <span className="text-[8px] text-white/90 font-bold mt-1 shadow-sm font-mono">1.2M</span>
                    </div>

                    {/* Comments button */}
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center text-sm shadow-md">
                        💬
                      </div>
                      <span className="text-[8px] text-white/90 font-bold mt-1 shadow-sm font-mono">4.5K</span>
                    </div>

                    {/* Save/Bookmark (For TikTok/Douyin) */}
                    {(selectedPlatform === "tiktok" || selectedPlatform === "douyin") && (
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center text-sm shadow-md">
                          ⭐
                        </div>
                        <span className="text-[8px] text-white/90 font-bold mt-1 shadow-sm font-mono">82K</span>
                      </div>
                    )}

                    {/* Share button */}
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center text-sm shadow-md">
                        ➡️
                      </div>
                      <span className="text-[8px] text-white/90 font-bold mt-1 shadow-sm font-mono">공유</span>
                    </div>

                    {/* Rotating Disk Profile */}
                    {selectedPlatform !== "shorts" && (
                      <div className="w-7 h-7 rounded-full border border-zinc-700 bg-zinc-950 flex items-center justify-center text-xs animate-spin-slow shadow-md ring-4 ring-black/30">
                        💿
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>
          </div>
          
          <div className="mt-3 text-[10px] text-zinc-550 dark:text-zinc-500 text-center font-mono">
            * 9:16 aspect ratio mockup (320px x 568px)
          </div>
        </div>

      </div>
    </div>
  );
}

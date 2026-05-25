import React from "react";

interface AdBannerProps {
  position: "top" | "bottom";
}

export default function AdBanner({ position }: AdBannerProps) {
  return (
    <div className={`w-full max-w-4xl mx-auto ${position === 'top' ? 'mt-4' : 'my-8'} bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-center text-center overflow-hidden relative`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/50 to-transparent animate-pulse" />
      <span className="bg-zinc-800 text-zinc-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mb-2">Advertisement</span>
      <h4 className="text-zinc-400 font-bold text-sm mb-1">Google AdSense Mock Slot ({position})</h4>
      <p className="text-zinc-600 text-xs">수익성 테스트를 위한 더미 배너 영역입니다.</p>
    </div>
  );
}

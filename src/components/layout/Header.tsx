import React from "react";

export default function Header() {
  return (
    <header id="app-header" className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-4 py-3.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-black overflow-hidden border border-zinc-800">
            <span className="absolute -left-0.5 text-[#00f2fe] font-black text-xl select-none">抖</span>
            <span className="absolute right-0.5 text-[#fe0979] font-black text-xl select-none">音</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#fe0979]/10 to-[#00f2fe]/10" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent flex items-center gap-1.5">
              Douyin Downloader
              <span className="bg-gradient-to-r from-rose-500 to-cyan-400 text-[10px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-widest leading-none scale-90">
                No Watermark
              </span>
            </h1>
            <p className="text-[10px] sm:text-xs text-zinc-500">워터마크 완전 무료 제거 프리미엄 서비스</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden leading-none md:flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-lg text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            서버 가동률 : 100% 무압축
          </span>
        </div>
      </div>
    </header>
  );
}

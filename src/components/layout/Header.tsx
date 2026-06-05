"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, DownloadCloud } from "lucide-react";

interface HeaderProps {
  theme?: "light" | "dark";
  lang?: "ko" | "en";
  setLang?: (val: "ko" | "en") => void;
}

export default function Header({ theme, lang = "ko", setLang }: HeaderProps) {
  const [activeTheme, setActiveTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    // HTML class를 기준으로 동적 감지
    const currentIsDark = document.documentElement.classList.contains("dark");
    setActiveTheme(currentIsDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setActiveTheme("light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setActiveTheme("dark");
    }
  };

  const isDark = activeTheme === "dark";

  return (
    <header 
      id="app-header" 
      className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 py-3.5 transition-colors ${
        isDark 
          ? "bg-zinc-950/80 border-zinc-900" 
          : "bg-white/80 border-gray-250"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className={`relative flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden border ${isDark ? 'bg-black border-zinc-800' : 'bg-white border-gray-300 group-hover:border-gray-400'} transition-colors shadow-sm`}>
              <span className="absolute left-1.5 text-[#00f2fe] font-black text-lg select-none">S</span>
              <span className="absolute right-1.5 text-[#fe0979] font-black text-lg select-none">P</span>
              <div className="absolute inset-0 bg-gradient-to-tr from-[#fe0979]/10 to-[#00f2fe]/10" />
            </div>
            <div>
              <h1 className={`text-base sm:text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r flex items-center gap-1.5 ${isDark ? 'from-zinc-100 via-zinc-200 to-zinc-400' : 'from-gray-900 via-gray-800 to-gray-650'}`}>
                ShortsPack
                <span className="bg-gradient-to-r from-rose-500 to-cyan-400 text-[10px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-widest leading-none scale-90">
                  PRO
                </span>
              </h1>
              <p className={`text-[10px] sm:text-xs ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>
                {lang === "ko" ? "비즈니스 & 마케팅 인사이트" : "Business & Marketing Insights"}
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link 
            href="/blog"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDark 
                ? "text-zinc-400 hover:text-white hover:bg-zinc-900" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === "ko" ? "블로그" : "Blog"}</span>
          </Link>
          <Link 
            href="/"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
              isDark 
                ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20" 
                : "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100/80"
            }`}
          >
            <DownloadCloud className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === "ko" ? "다운로더" : "Downloader"}</span>
          </Link>

          <a 
            href="https://global-toolbox.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
              isDark 
                ? "text-zinc-400 hover:text-white hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700" 
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200"
            }`}
            title={lang === "ko" ? "글로벌 툴박스 바로가기" : "Go to Global Toolbox"}
          >
            <span>🧰</span>
            <span className="hidden sm:inline">{lang === "ko" ? "글로벌 툴박스" : "Global Toolbox"}</span>
          </a>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              isDark
                ? "bg-zinc-900 border-zinc-800 text-yellow-400 hover:text-yellow-300 hover:border-zinc-700"
                : "bg-gray-100/80 border-gray-200 text-zinc-650 hover:text-zinc-900 hover:bg-gray-200"
            }`}
            title={lang === "ko" ? "화면 모드 전환" : "Toggle theme"}
          >
            {isDark ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* KO | EN Language Toggle */}
          {setLang && (
            <div className={`flex items-center border rounded-lg p-0.5 ml-1 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-100/80 border-gray-200'}`}>
              <button
                onClick={() => setLang("ko")}
                className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  lang === "ko"
                    ? "bg-[#fe0979]/20 text-[#fe0979] border border-[#fe0979]/30 font-extrabold"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                KO
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  lang === "en"
                    ? "bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/30 font-extrabold"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                EN
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

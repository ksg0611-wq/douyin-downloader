import React from "react";
import Link from "next/link";

interface FooterProps {
  theme?: "light" | "dark";
}

export default function Footer({ theme = "dark" }: FooterProps) {
  const isDark = theme === "dark";
  
  return (
    <footer className={`mt-16 py-8 px-4 text-center text-xs transition-colors ${
      isDark 
        ? "border-t border-zinc-900 bg-zinc-950 text-zinc-500" 
        : "border-t border-zinc-200 bg-zinc-50 text-zinc-400"
    }`}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} Douyin Downloader. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/terms" className={`transition-colors ${isDark ? "hover:text-zinc-300" : "hover:text-zinc-600"}`}>이용약관</Link>
          <Link href="/privacy" className={`transition-colors ${isDark ? "hover:text-zinc-300" : "hover:text-zinc-600"}`}>개인정보처리방침</Link>
          <a href="mailto:support@example.com" className={`transition-colors ${isDark ? "hover:text-zinc-300" : "hover:text-zinc-600"}`}>문의하기</a>
        </div>
      </div>
    </footer>
  );
}

import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 py-8 px-4 text-center text-xs transition-colors border-t border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-400">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p>&copy; {new Date().getFullYear()} ShortsPack Pro. All rights reserved.</p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Contact: ksg0611@gmail.com</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Link href="/about" className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-200">소개 (About)</Link>
          <Link href="/terms" className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-200">이용약관</Link>
          <Link href="/privacy" className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-200">개인정보처리방침</Link>
          <a href="mailto:ksg0611@gmail.com" className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-200">문의하기</a>
        </div>
      </div>
    </footer>
  );
}

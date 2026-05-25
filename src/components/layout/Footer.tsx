import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 mt-16 py-8 px-4 text-center text-zinc-500 text-xs">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} Douyin Downloader. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-zinc-300 transition-colors">이용약관</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">개인정보처리방침</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">문의하기</a>
        </div>
      </div>
    </footer>
  );
}

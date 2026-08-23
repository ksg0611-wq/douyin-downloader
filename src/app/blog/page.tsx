import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import React from "react";

import { BLOG_POSTS } from "@/data/blogPosts";

export const metadata: Metadata = {
  title: "ShortsPack Pro 블로그 | 숏폼 마케팅 & 알고리즘 인사이트",
  description: "유튜브 쇼츠, 인스타그램 릴스, 틱톡 알고리즘 최적화부터 쉐도우밴 탈출, 수익 창출까지. 상위 1% 크리에이터를 위한 최신 마케팅 인사이트를 제공합니다.",
  alternates: {
    canonical: "https://shortspack.com/blog",
  },
  openGraph: {
    title: "ShortsPack Pro 블로그",
    description: "숏폼 마케팅 트렌드와 알고리즘 공략의 모든 것",
    url: "https://shortspack.com/blog",
    type: "website",
  },
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#060609] dark:text-zinc-100 font-sans flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-12 md:py-20 z-10">
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
            숏폼 크리에이터 <span className="text-rose-500">인사이트</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            알고리즘을 정복하고 수익을 극대화하기 위한 최신 숏폼 마케팅 트렌드와 심층 가이드를 만나보세요.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BLOG_POSTS.map((post, idx) => (
            <Link 
              key={idx} 
              href={post.href}
              className="group flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${post.color}`}>
                    {post.category}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                    {post.date}
                  </span>
                </div>
                <h2 className="text-lg font-bold mb-3 group-hover:text-rose-500 transition-colors leading-snug text-zinc-900 dark:text-zinc-100">
                  {post.title}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3 mb-6">
                  {post.desc}
                </p>
                <div className="mt-auto flex items-center text-rose-500 text-xs font-bold uppercase tracking-wider group-hover:gap-2 transition-all">
                  Read Article <span className="text-base leading-none">➔</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

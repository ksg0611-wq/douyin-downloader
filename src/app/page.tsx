import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdBanner from "@/components/layout/AdBanner";
import BlogFilterBar from "./BlogFilterBar";
import { getSortedPostsData } from "@/lib/posts";

export const metadata: Metadata = {
  title: "ShortsPack Pro - 100만 뷰를 부르는 크리에이터 종합 AI 툴박스",
  description: "숏폼 크리에이터를 위한 AI 대본 생성, 알고리즘 분석, 클린 비디오 다운로더까지. 떡상을 위한 모든 도구를 무료로 만나보세요.",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogHome({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const activeTag = (resolvedParams.tag as string)?.toUpperCase() || "ALL";

  const posts = getSortedPostsData();

  // posts에 존재하는 모든 카테고리(태그)를 동적으로 추출하고 대문자로 변환하여 중복 제거
  const availableTags = [
    "ALL",
    ...Array.from(new Set(posts.map((post) => post.category.toUpperCase()))),
  ];

  // 활성화된 태그에 맞춰 글 필터링
  const filteredPosts = activeTag === "ALL"
    ? posts
    : posts.filter((post) => post.category.toUpperCase() === activeTag);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#060609] dark:text-zinc-100 font-sans selection:bg-rose-500/20 selection:text-rose-900 flex flex-col transition-colors duration-300">
      <Header />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-12 md:py-20 z-10 flex flex-col items-center">
        {/* Blog Header */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
            Insights & Strategies
          </h2>
          <p className="text-zinc-550 dark:text-zinc-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            마케터를 위한 실전 숏폼 마케팅 트렌드와 이커머스 매출 증대 전략을 심도 있게 다룹니다.
          </p>
        </div>

        {/* Tag Filtering Pill Tabs (Wrapped in Suspense to isolate useSearchParams CSR de-opt) */}
        <div className="w-full flex justify-center mb-10 overflow-x-auto scrollbar-none pb-2">
          <Suspense fallback={
            <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-full border border-zinc-200/50 dark:border-zinc-800/50">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap text-zinc-450`}
                  disabled
                >
                  {tag}
                </button>
              ))}
            </div>
          }>
            <BlogFilterBar availableTags={availableTags} />
          </Suspense>
        </div>

        {/* Blog Responsive 3-Column Grid (Fully Rendered on Server Side for SEO) */}
        <div className="w-full">
          {filteredPosts.length === 0 ? (
            <div className="text-center text-zinc-500 dark:text-zinc-400 py-20 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-3xl">
              선택한 카테고리의 아티클이 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Link
                  href={`/blog/${post.id}`}
                  key={post.id}
                  className="group bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Top: Category Tag Badge & Date & Read Time */}
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 px-2.5 py-1 rounded-full uppercase tracking-wider text-[10px]">
                        {post.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Title */}
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-450 transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Bottom: Excerpt Summary */}
                    <p className="text-zinc-650 dark:text-zinc-405 leading-relaxed text-sm line-clamp-3">
                      {post.summary}
                    </p>
                  </div>

                  {/* Read Article Button */}
                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900/60 flex items-center justify-between text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-450 transition-colors">
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <AdBanner position="bottom" />
      </main>

      {/* Light Footer Wrapper */}
      <div className="bg-white dark:bg-[#060609] border-t border-zinc-200 dark:border-zinc-900">
        <Footer />
      </div>
    </div>
  );
}

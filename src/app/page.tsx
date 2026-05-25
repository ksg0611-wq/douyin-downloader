import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MOCK_BLOG_POSTS } from "@/data/blog";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import Link from "next/link";

export default function BlogHome() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-rose-500/20 selection:text-rose-900 flex flex-col">
      <Header theme="light" />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-12 md:py-20 z-10 flex flex-col items-center">
        {/* Blog Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900">
            Insights & Strategies
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            마케터를 위한 실전 숏폼 마케팅 트렌드와 이커머스 매출 증대 전략을 심도 있게 다룹니다.
          </p>
        </div>

        {/* Blog List */}
        <div className="w-full space-y-10">
          {MOCK_BLOG_POSTS.map((post) => (
            <article 
              key={post.id} 
              className="group cursor-pointer border-b border-zinc-200 pb-10 last:border-0 transition-colors"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-xs font-medium text-zinc-500">
                  <span className="text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wider text-[10px]">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-zinc-900 group-hover:text-rose-600 transition-colors leading-snug">
                  {post.title}
                </h3>
                
                <p className="text-zinc-600 leading-relaxed text-sm md:text-base mt-1 line-clamp-3">
                  {post.summary}
                </p>
                
                <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-900 mt-2 group-hover:text-rose-600 transition-colors">
                  Read Article
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Light Footer Wrapper */}
      <div className="bg-white border-t border-zinc-200">
        <Footer theme="light" />
      </div>
    </div>
  );
}

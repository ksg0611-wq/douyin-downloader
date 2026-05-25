import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CPABanner from "@/components/CPABanner";
import { CPA_ADS } from "@/data/ads";
import { getPostData } from "@/lib/posts";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const postData = getPostData(slug);

  if (!postData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col">
      <Header theme="light" />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-12 md:py-20 z-10">
        
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          목록으로 돌아가기
        </Link>

        {/* Post Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 text-sm font-medium text-zinc-500 mb-4">
            <span className="text-rose-600 font-bold bg-rose-50 px-3 py-1 rounded-full uppercase tracking-wider text-[11px]">
              {postData.category}
            </span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{postData.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{postData.readTime}</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 leading-tight">
            {postData.title}
          </h1>
          <p className="text-zinc-500 text-base md:text-lg mt-4 leading-relaxed">
            {postData.summary}
          </p>
        </header>

        {/* Markdown Content rendered via prose */}
        <article className="prose prose-zinc prose-rose max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-a:text-rose-600 hover:prose-a:text-rose-500 prose-img:rounded-xl">
          {(() => {
            // 두 번째 <h2> 태그(## )를 기준으로 분리 시도
            const content = postData.content;
            let part1 = content;
            let part2 = "";
            
            const firstH2 = content.indexOf('\n## ');
            if (firstH2 !== -1) {
              const secondH2 = content.indexOf('\n## ', firstH2 + 1);
              if (secondH2 !== -1) {
                part1 = content.substring(0, secondH2);
                part2 = content.substring(secondH2);
              } else {
                // H2가 하나뿐이거나 없으면 절반 지점의 단락 기준 분리
                const mid = Math.floor(content.length / 2);
                const splitIdx = content.indexOf('\n\n', mid) !== -1 ? content.indexOf('\n\n', mid) : mid;
                part1 = content.substring(0, splitIdx);
                part2 = content.substring(splitIdx);
              }
            } else {
              const mid = Math.floor(content.length / 2);
              const splitIdx = content.indexOf('\n\n', mid) !== -1 ? content.indexOf('\n\n', mid) : mid;
              part1 = content.substring(0, splitIdx);
              part2 = content.substring(splitIdx);
            }

            return (
              <>
                <ReactMarkdown>{part1}</ReactMarkdown>
                
                {part2 && (
                  <div className="not-prose my-10 px-2 sm:px-4">
                    <CPABanner ad={CPA_ADS.blog_middle} type="horizontal" />
                  </div>
                )}
                
                {part2 && <ReactMarkdown>{part2}</ReactMarkdown>}
              </>
            );
          })()}
        </article>

        {/* CPA Banner (Card Type) */}
        <div className="mt-16 pt-8 border-t border-zinc-200">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-zinc-900">🎁 에디터 추천</h3>
            <p className="text-sm text-zinc-500 mt-1">블로그 독자만을 위한 특별한 혜택을 확인해 보세요!</p>
          </div>
          <CPABanner ad={CPA_ADS.main_cpa} type="card" />
        </div>
      </main>

      <div className="bg-white border-t border-zinc-200">
        <Footer theme="light" />
      </div>
    </div>
  );
}

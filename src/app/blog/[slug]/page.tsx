import React from "react";
import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BlogCTA from "@/components/home/BlogCTA";
import { getPostData } from "@/lib/posts";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const postData = getPostData(slug);

  if (!postData) {
    return {
      title: "포스트를 찾을 수 없습니다 | ShortsPack Pro",
    };
  }

  return {
    title: `${postData.title} | ShortsPack Pro`,
    description: postData.summary,
    openGraph: {
      title: `${postData.title} | ShortsPack Pro`,
      description: postData.summary,
      url: `https://shortspack.com/blog/${slug}`,
      type: "article",
      locale: "ko_KR",
      siteName: "ShortsPack Pro",
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const postData = getPostData(slug);

  if (!postData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#060609] dark:text-zinc-100 font-sans flex flex-col transition-colors duration-300">
      <Header />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-12 md:py-20 z-10">
        
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          목록으로 돌아가기
        </Link>

        {/* Post Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
            <span className="text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 px-3 py-1 rounded-full uppercase tracking-wider text-[11px]">
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
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
            {postData.title}
          </h1>
          <p className="text-zinc-550 dark:text-zinc-400 text-base md:text-lg mt-4 leading-relaxed">
            {postData.summary}
          </p>
        </header>

        {/* Markdown Content rendered via prose */}
        <article className="prose prose-zinc prose-rose dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-a:text-rose-600 hover:prose-a:text-rose-500 prose-img:rounded-xl">
          <ReactMarkdown>{postData.content}</ReactMarkdown>
        </article>

        <BlogCTA category={postData.category} />

      </main>

      <div className="bg-white dark:bg-[#060609] border-t border-zinc-200 dark:border-zinc-900">
        <Footer />
      </div>
    </div>
  );
}

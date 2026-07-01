import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolSubNav from "@/components/tools/ToolSubNav";
import { Zap, Hash, Clock, Mail, ArrowRight, LayoutGrid } from "lucide-react";

export const metadata: Metadata = {
  title: "비즈니스 & 마케팅 스마트 도구 모음 - ShortsPack Pro",
  description: "숏폼 기획부터 이탈률 분석, 인기 해시태그 스캔 및 협찬 제안서 작성까지 ShortsPack Pro의 유용한 마케팅 도구들을 한눈에 탐색해 보세요.",
  alternates: {
    canonical: "https://shortspack.com/tools"
  }
};

interface ToolCard {
  id: string;
  title: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

const TOOL_CARDS: ToolCard[] = [
  {
    id: "hook-generator",
    title: "터지는 1초 훅 제조기",
    desc: "시청자의 초반 1초 이탈을 방지하고 알고리즘 도달률을 높여줄 5가지 바이럴 오프닝 멘트 템플릿을 즉시 생성합니다.",
    href: "/tools/hook-generator",
    icon: <Zap className="w-6 h-6 text-rose-500" />,
    badge: "FAST",
    badgeColor: "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-400"
  },
  {
    id: "hashtag-scanner",
    title: "알고리즘 해시태그 스캐너",
    desc: "영상의 카테고리와 주제에 어울리는 최적의 인기 해시태그 조합을 스캔하고, 바구니 기능을 통해 한 번에 묶음 복사합니다.",
    href: "/tools/hashtag-scanner",
    icon: <Hash className="w-6 h-6 text-purple-500" />,
    badge: "SEO",
    badgeColor: "bg-purple-50 border-purple-200 text-purple-650 dark:bg-purple-500/15 dark:border-purple-500/30 dark:text-purple-400"
  },
  {
    id: "tempo-calculator",
    title: "숏폼 템포 & 이탈률 방어 계산기",
    desc: "대본의 글자 수 대비 예상 소요 시간을 측정하고, 50자 이상의 긴 문장(위험 구간)을 분석하여 이탈률 방어 처방을 내립니다.",
    href: "/tools/tempo-calculator",
    icon: <Clock className="w-6 h-6 text-amber-500" />,
    badge: "TEMPO",
    badgeColor: "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-400"
  },
  {
    id: "sponsor-pitch-generator",
    title: "브랜드 협찬 제안서 자동 생성기",
    desc: "내 채널 정보와 타겟 브랜드를 입력하면 마케터의 오픈율을 높여줄 세련된 협찬 제안 비즈니스 콜드메일을 AI로 빌드합니다.",
    href: "/tools/sponsor-pitch-generator",
    icon: <Mail className="w-6 h-6 text-indigo-500" />,
    badge: "AI",
    badgeColor: "bg-indigo-50 border-indigo-200 text-indigo-650 dark:bg-indigo-500/15 dark:border-indigo-500/30 dark:text-indigo-400"
  }
];

export default function ToolHubPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "비즈니스 & 마케팅 스마트 도구 모음 - ShortsPack Pro",
    "description": "숏폼 기획부터 이탈률 분석, 인기 해시태그 스캔 및 협찬 제안서 작성까지 ShortsPack Pro의 유용한 마케팅 도구들을 한눈에 탐색해 보세요.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "url": "https://shortspack.com/tools",
    "author": {
      "@type": "Organization",
      "name": "ShortsPack Pro",
      "url": "https://shortspack.com"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-50 text-zinc-800 dark:bg-[#060609] dark:text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-white transition-colors duration-300">
        
        {/* Atmospheric Lighting */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
        
        <Header />

        <ToolSubNav />

        <main className="flex-grow max-w-6xl w-full mx-auto px-4 pb-12 z-10 space-y-8">
          
          {/* 타이틀 헤더 */}
          <div className="text-center space-y-3 max-w-2xl mx-auto py-4">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              🛠️ 스마트 마케팅 도구 모음
            </h2>
            <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
              숏폼 콘텐츠 기획, 가독성 검토, 시청 유입 태깅 및 협찬 제안서 빌딩까지 크리에이터와 마케터를 위한 핵심 비즈니스 도구들을 무료로 활용해 보세요.
            </p>
          </div>

          {/* 도구 그리드 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {TOOL_CARDS.map((card) => (
              <div 
                key={card.id} 
                className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/10 transition-colors" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-150 dark:border-zinc-800">
                      {card.icon}
                    </div>
                    {card.badge && (
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                        {card.badge}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-white tracking-tight">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-bold">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <Link 
                    href={card.href}
                    className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-350 dark:hover:text-white dark:hover:bg-zinc-850 text-xs font-bold transition-all active:scale-95 shadow-sm group-hover:border-rose-450/40"
                  >
                    <span>도구 실행하기</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </main>

        <Footer />
      </div>
    </>
  );
}

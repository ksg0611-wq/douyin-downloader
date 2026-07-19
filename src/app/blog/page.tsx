import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import React from "react";

export const metadata: Metadata = {
  title: "ShortsPack Pro 블로그 | 숏폼 마케팅 & 알고리즘 인사이트",
  description: "유튜브 쇼츠, 인스타그램 릴스, 틱톡 알고리즘 최적화부터 쉐도우밴 탈출, 수익 창출까지. 상위 1% 크리에이터를 위한 최신 마케팅 인사이트를 제공합니다.",
  openGraph: {
    title: "ShortsPack Pro 블로그",
    description: "숏폼 마케팅 트렌드와 알고리즘 공략의 모든 것",
    url: "https://shortspack.com/blog",
    type: "website",
  },
};

const BLOG_POSTS = [
  {
    title: "숏폼 시청 지속시간(Retention) 향상법: 초반 3초와 이탈 방어 전략",
    desc: "알고리즘의 유일한 신(God) '시청 지속시간'. 초반 3초 후킹부터 마의 15초 이탈 구간을 완벽하게 방어하는 심리적 편집 전략을 파헤칩니다.",
    href: "/blog/shorts-retention-strategy",
    date: "2026년 7월 20일",
    category: "Algorithm & Analytics",
    color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
  },
  {
    title: "인공지능(AI)으로 떡상하는 쇼츠 대본 10배 빠르게 양산하는 프롬프트 가이드",
    desc: "더 이상 대본 작성에 밤새지 마세요. 챗GPT와 제미나이를 마법처럼 부리는 3초 후킹 프롬프트 엔지니어링 공식을 낱낱이 파헤칩니다.",
    href: "/blog/ai-shorts-script-guide",
    date: "2026년 7월 19일",
    category: "AI & Prompt Engineering",
    color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10",
  },
  {
    title: "유튜브 쇼츠 저작권 침해 피하는 3가지 필수 체크리스트 (5초 법칙의 진실)",
    desc: "타인의 영상이나 음악을 짧게 쓰면 안전할까요? 잘못된 2차 창작으로 인한 채널 삭제를 막기 위해 공정 이용(Fair Use) 가이드라인을 상세히 분석합니다.",
    href: "/blog/shorts-copyright-guide",
    date: "2026년 7월 17일",
    category: "Copyright & Legal",
    color: "text-red-500 bg-red-50 dark:bg-red-500/10",
  },
  {
    title: "글로벌 타겟 숏폼 알고리즘 기반 최적 업로드 시간",
    desc: "언제 올려야 가장 많은 시청자가 볼까요? 국가별, 플랫폼별, 요일별 데이터에 기반한 2026년 최신 숏폼 업로드 골든타임을 심층 분석합니다.",
    href: "/blog/global-best-upload-time",
    date: "2026년 7월 16일",
    category: "Global Marketing",
    color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10",
  },
  {
    title: "2026 최신 쇼츠 & 릴스 안전영역(Safe Zone) 템플릿",
    desc: "기껏 만든 자막이 좋아요 버튼에 가려지나요? 틱톡, 릴스, 쇼츠의 픽셀 단위 안전영역 가이드 및 실시간 테스트 방법을 알려드립니다.",
    href: "/blog/shorts-reels-safe-zone",
    date: "2026년 7월 16일",
    category: "Video Editing",
    color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-500/10",
  },
  {
    title: "틱톡/쇼츠 쉐도우밴(Shadowban) 원인 및 계정 복구",
    desc: "갑자기 0뷰에 갇히셨나요? 쉐도우밴 유발 민감어 및 행동 패턴과 확실한 계정 복구 가이드 5단계를 제공합니다.",
    href: "/blog/shadowban-recovery-guide",
    date: "2026년 7월 16일",
    category: "Security",
    color: "text-rose-500 bg-rose-50 dark:bg-rose-500/10",
  },
  {
    title: "상위 1% 크리에이터의 바이럴 영상 역설계 루틴",
    desc: "잘 터진 숏폼 대본을 훔치는 합법적인 방법. 경쟁사의 바이럴 영상을 역설계하여 내 채널에 맞는 떡상 대본으로 재조립하는 3단계를 공개합니다.",
    href: "/blog/viral-video-reverse-engineering",
    date: "2026년 7월 13일",
    category: "Content Strategy",
    color: "text-violet-500 bg-violet-50 dark:bg-violet-500/10",
  },
  {
    title: "터지는 릴스 알고리즘의 비밀: 초반 3초 후킹 대본 공식",
    desc: "시청자의 엄지손가락을 멈추게 하는 마법. 0.1초 만에 승부가 갈리는 숏폼 세계에서 끝까지 보게 만드는 3초 후킹 멘트 공식을 낱낱이 파헤칩니다.",
    href: "/blog/reels-algorithm-hook",
    date: "2026년 7월 13일",
    category: "Algorithm",
    color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
  },
  {
    title: "유튜브 쇼츠 수익 창출 조건 및 2026 최신 단가 총정리",
    desc: "쇼츠로 한 달에 얼마를 벌 수 있을까요? 2026년 최신 수익 창출 승인 조건과 국가별/카테고리별 RPM(조회수 1천 회당 수익) 단가를 총정리합니다.",
    href: "/blog/shorts-monetization",
    date: "2026년 7월 13일",
    category: "Monetization",
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
  }
];

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

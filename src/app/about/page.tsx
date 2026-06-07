"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Mail, Copy, Check, ExternalLink, Terminal, BookOpen, Users, Compass } from "lucide-react";

export default function AboutPage() {
  const [copied, setCopied] = useState(false);
  const email = "ksg0611@gmail.com";

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#060609] dark:text-zinc-100 font-sans flex flex-col transition-colors duration-300">
      <Header />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-12 md:py-20 z-10 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/30 border border-violet-200/50 dark:border-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-semibold tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5" />
            About Us
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 dark:from-violet-400 dark:via-indigo-400 dark:to-blue-400 bg-clip-text text-transparent pb-2">
            ShortsPack Pro
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            글로벌 숏폼 크리에이터가 오직 창작에만 집중할 수 있도록 돕는 스마트한 올인원 툴박스입니다.
          </p>
        </section>

        {/* Brand Core Values (Grid cards) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">사이트 개발 목적</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm md:text-base">
                도우인(Douyin), 샤오홍슈(Xiaohongshu), 틱톡(TikTok) 등 급변하는 글로벌 숏폼 트렌드 속에서 크리에이터들은 콘텐츠 기획뿐만 아니라 소스 수집, 가치 분석, 타겟 분석 등 수많은 보이지 않는 태스크에 시간을 소모하고 있습니다. 
                ShortsPack Pro는 이러한 비효율적인 수동 작업을 완전히 자동화하고, 크리에이터 본연의 창의성과 스토리에 몰입할 수 있도록 돕기 위해 만들어졌습니다.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Terminal className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">제공하는 솔루션</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm md:text-base">
                단순 숏폼 비디오/데이터 다운로더에 그치지 않고, AI 기반의 바이럴 구조 역설계 분석기, 최적의 시선을 끄는 썸네일 카피 생성기, 이탈률을 최소화하는 CTA 멘트 도출, 피크 업로드 골든타임 계산기 및 스폰서 제안서 자동 생성기까지 크리에이터 비즈니스의 모든 여정을 유기적인 파이프라인으로 연결하여 생산성을 극대화합니다.
              </p>
            </div>
          </div>
        </section>

        {/* Founder's Philosophy */}
        <section className="p-8 md:p-10 rounded-3xl bg-gradient-to-b from-white to-zinc-50/50 dark:from-zinc-900/50 dark:to-zinc-950/30 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
            <BookOpen className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">개발 및 운영 철학</h2>
          </div>
          <div className="space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
            <p>
              안녕하세요. ShortsPack Pro를 개발하고 운영하는 <strong>Kim Sung-geun</strong>입니다.
            </p>
            <p>
              저는 소프트웨어가 사람들의 일상을 혁신하고, 특히 지식과 가치를 창출하는 크리에이터들에게 새로운 가능성을 열어줄 수 있다고 믿습니다. 오늘날의 콘텐츠 생태계, 특히 숏폼(Short-form) 콘텐츠 영역은 그 어느 때보다 빠르게 변화하고 있으며 크리에이터 개인에게 요구되는 역량과 리소스는 기하급수적으로 늘어나고 있습니다. 
            </p>
            <p>
              이러한 환경에서 크리에이터들이 단순하고 반복적인 작업에 아까운 시간을 낭비하지 않고, 본질적인 창작과 스토리텔링에 오롯이 집중할 수 있도록 돕는 것이 ShortsPack Pro의 핵심적인 방향성입니다. 이를 위해 도우인, 샤오홍슈, 틱톡 등 다양한 글로벌 플랫폼을 분석하고, AI 기술을 결합하여 분석부터 작성까지의 다각적인 도구들을 원스톱으로 탑재하고 있습니다.
            </p>
            <p>
              저는 단순한 유틸리티 도구의 공급에 안주하지 않고, <strong>소프트웨어 교육과 실질적인 기술 개발이 긴밀하게 호흡하며 선순환하는 생태계</strong>를 지향합니다. 코딩을 배우고 기술을 개발하는 배움의 과정은 결국 현실 세계에서 누군가가 겪고 있는 명확한 골칫거리와 현실적 문제를 해결해 주기 위한 여정이어야 합니다. 
            </p>
            <p>
              ShortsPack Pro는 이러한 신조와 철학을 증명하고 실천하는 첫걸음이자, 고도화된 기술을 통해 전 세계의 독립 크리에이터와 1인 기업가들이 지속 가능한 성장을 스스로 이뤄낼 수 있도록 뒷받침하는 단단한 인프라가 될 것입니다. 앞으로도 유저들의 소중한 실사용 피드백을 신속하게 반영하고 기능을 끊임없이 개선하여, 크리에이터 여러분들의 든든하고 신뢰할 수 있는 개발적 파트너로 동행하겠습니다.
            </p>
          </div>
        </section>

        {/* Contact section */}
        <section className="max-w-md mx-auto text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">궁금한 점이 있으신가요?</h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              기능 제안, 제휴 문의, 버그 리포트 등 운영자에게 직접 연락할 수 있습니다.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-violet-50/50 dark:bg-violet-950/10 border border-violet-100/80 dark:border-violet-900/30 flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Mail className="w-5 h-5" />
            </div>
            
            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contact Email</span>
              <p className="text-zinc-900 dark:text-white font-mono font-bold text-lg select-all">
                {email}
              </p>
            </div>

            <div className="flex w-full gap-2">
              <button
                onClick={handleCopyEmail}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-98"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>이메일 주소 복사</span>
                  </>
                )}
              </button>

              <a
                href={`mailto:${email}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 text-white transition-all active:scale-98"
              >
                <span>이메일 보내기</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <div className="bg-white dark:bg-[#060609] border-t border-zinc-200 dark:border-zinc-900">
        <Footer />
      </div>
    </div>
  );
}

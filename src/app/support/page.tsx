"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { HelpCircle, ChevronDown, ChevronUp, Mail, Info, MessageSquare } from "lucide-react";
import FAQSection from "@/components/home/FAQSection";

export default function SupportPage() {
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("faq-1");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#060609] dark:text-zinc-100 font-sans selection:bg-rose-500/20 selection:text-rose-900 flex flex-col transition-colors duration-300">
      <Header />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-12 md:py-20 z-10 space-y-16">
        
        {/* Support Banner */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Support Center</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
            ShortsPack Pro 고객지원
          </h2>
          <p className="text-zinc-550 dark:text-zinc-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            서비스 이용 안내, 자주 묻는 질문, 1:1 문의 등 궁금한 점을 쉽고 빠르게 해결해 드립니다.
          </p>
        </div>

        {/* 1. About Section */}
        <section id="about" className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 md:p-10 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">ShortsPack Pro 소개</h3>
          </div>
          <p className="text-zinc-650 dark:text-zinc-400 text-sm md:text-base leading-relaxed">
            ShortsPack Pro는 글로벌 숏폼(TikTok, Douyin, Reels, YouTube Shorts) 크리에이터 및 디지털 마케터들이 언어의 장벽과 플랫폼 고유의 환경적 제약을 넘어 트래픽을 선점하고 채널 가치를 높일 수 있도록 지원하는 **지능형 크리에이터 종합 웹앱 툴박스**입니다.
          </p>
          <p className="text-zinc-650 dark:text-zinc-400 text-sm md:text-base leading-relaxed">
            클린 버전 초고화질 무손실 숏폼 영상 저장을 통한 벤치마킹 리소스 제공부터 시작하여 AI 기반의 3초 후킹 대본 교정(대본 닥터), 틱톡/도우인 섀도우밴 민감어 스캔, 글로벌 최적 업로드 예약 타이밍 자동 역산 및 AI 협찬 콜드메일 생성기까지 1인 미디어 비즈니스가 수익 다각화를 이루도록 안전하고 강력한 인프라를 선사합니다.
          </p>
        </section>

        {/* 2. FAQ Section */}
        <div id="faq" className="-mt-6">
          <FAQSection expandedFaqId={expandedFaqId} setExpandedFaqId={setExpandedFaqId} />
        </div>

        {/* 3. Contact Section */}
        <section id="contact" className="bg-gradient-to-tr from-rose-500/10 to-cyan-500/10 dark:from-rose-950/20 dark:to-cyan-950/20 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 md:p-10 shadow-sm text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/20">
              <Mail className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">1:1 고객 문의 & 파트너십 제안</h3>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto text-xs md:text-sm leading-relaxed">
              기타 해결되지 않은 이용 관련 불편이나 버그 제안, 그리고 광고 및 비즈니스 협업 제안은 언제든지 아래 메일로 보내주세요.
            </p>
          </div>

          <div className="inline-block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-6 py-3 rounded-2xl shadow-sm">
            <a 
              href="mailto:contact@shortspack.com" 
              className="text-lg md:text-xl font-extrabold text-rose-600 dark:text-rose-455 hover:underline flex items-center justify-center gap-2 cursor-pointer"
            >
              contact@shortspack.com
            </a>
          </div>
        </section>

      </main>

      {/* Light Footer Wrapper */}
      <div className="bg-white dark:bg-[#060609] border-t border-zinc-200 dark:border-zinc-900">
        <Footer />
      </div>
    </div>
  );
}

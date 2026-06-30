"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { HelpCircle, ChevronDown, ChevronUp, Mail, Info, MessageSquare } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function SupportPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs: FAQItem[] = [
    {
      question: "다운로드한 벤치마킹용 영상은 어떻게 활용해야 하나요?",
      answer: "본 서비스는 크리에이터의 순수 개인 학습 및 콘텐츠 벤치마킹 분석 목적에 한하여 무료로 제공되는 클린 비디오 다운로드 툴입니다. 다운로드한 영상을 타 플랫폼에 무단으로 재업로드하는 것은 권장하지 않습니다."
    },
    {
      question: "다운로드 가능한 동영상 플랫폼은 무엇인가요?",
      answer: "현재 중국의 도우인(Douyin) 및 샤오홍슈(Xiaohongshu) 플랫폼의 고화질 비디오 및 오리지널 이미지 저장을 공식 지원하고 있습니다. 타 숏폼 플랫폼의 지원 범위도 점차 확장 예정입니다."
    },
    {
      question: "AI 도구(대본 추출, 분석 등)의 사용 횟수에 제한이 있나요?",
      answer: "기본적으로 비회원 상태에서도 일일 제한 크레딧 내에서 사용 가능하며, 구글 로그인을 하시면 1인 미디어 창작에 필요한 넉넉한 분량의 추가 무료 일일 크레딧을 즉시 충전받아 사용하실 수 있습니다."
    },
    {
      question: "다운로드한 비디오를 다른 플랫폼에 재업로드해도 되나요?",
      answer: "불가합니다. ShortsPack Pro를 통해 내려받은 모든 원본 미디어는 오직 컷편집 템포 분석, 연출 기법 벤치마킹 등 개인의 학술 연구 목적에 한해서만 사용해야 합니다. 타인의 저작권을 침해하는 상업적 재배포는 원작자와 플랫폼 가이드라인에 위배될 수 있으므로 각별한 주의가 필요합니다."
    },
    {
      question: "구글 로그인 정보 등 개인정보는 어떻게 안전하게 관리되나요?",
      answer: "구글 파이어베이스(Firebase) 보안 인프라를 거쳐 업계 표준의 암호화 시스템으로 철저히 격리 관리됩니다. 귀하의 구글 계정 비밀번호 등은 당사 시스템에 절대 수집·저장되지 않으며, 개인정보처리방침을 엄격히 준수합니다."
    },
    {
      question: "동영상 다운로드 및 분석 에러가 날 때는 어떻게 해야 하나요?",
      answer: "동영상 링크가 올바른지, 혹은 원본 게시물이 삭제되었거나 비공개 상태인지 확인해 보세요. 또한 일시적인 플랫폼 서버 지연일 수 있으므로 브라우저 캐시를 완전히 비운 뒤 Chrome(크롬) 웹 브라우저에서 재시도해 보시기 바랍니다. 에러가 지속된다면 해당 URL 주소를 문의 이메일로 접수해 주시면 즉시 점검하겠습니다."
    }
  ];

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
        <section id="faq" className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">자주 묻는 질문 (FAQ)</h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index} 
                  className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-zinc-900 dark:text-zinc-100 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors"
                  >
                    <span className="text-sm md:text-base">{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-zinc-400" />
                    )}
                  </button>

                  <div 
                    className={`transition-all duration-300 ${
                      isOpen ? "max-h-[500px] border-t border-zinc-100 dark:border-zinc-900" : "max-h-0 overflow-hidden"
                    }`}
                  >
                    <p className="p-6 text-zinc-650 dark:text-zinc-400 text-xs md:text-sm leading-relaxed bg-zinc-50/50 dark:bg-zinc-950/20">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

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
              href="mailto:ksg0611@gmail.com" 
              className="text-lg md:text-xl font-extrabold text-rose-600 dark:text-rose-455 hover:underline flex items-center justify-center gap-2 cursor-pointer"
            >
              ksg0611@gmail.com
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

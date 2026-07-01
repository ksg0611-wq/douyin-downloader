"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Mail, Copy, Check, ExternalLink, Compass } from "lucide-react";

export default function AboutClient() {
  const [copied, setCopied] = useState(false);
  const email = "contact@shortspack.com";

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

      <main className="flex-grow max-w-2xl w-full mx-auto px-4 py-16 md:py-24 z-10 flex flex-col items-center justify-center text-center space-y-12">
        {/* Logo and Brand Title */}
        <section className="space-y-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md mb-2">
            <Compass className="w-8 h-8 animate-pulse" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/30 border border-violet-200/50 dark:border-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-semibold tracking-wider uppercase">
            About Us
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
            About ShortsPack Pro
          </h1>
        </section>

        {/* Content Section (Centralized Layout) */}
        <section className="space-y-8 text-zinc-700 dark:text-zinc-300 leading-relaxed text-base w-full max-w-xl">
          <div className="space-y-4">
            <p className="font-semibold text-zinc-900 dark:text-white text-lg">
              ShortsPack Pro는 전 세계 크리에이터들이 숏폼 콘텐츠를 더 효율적으로 기획, 분석, 제작할 수 있도록 돕는 전문 툴박스입니다.
            </p>
            <p>
              도우인, 샤오홍슈, 틱톡, 릴스, 쇼츠 등 글로벌 플랫폼이 크리에이터 생태계의 대세로 자리 잡으면서, 창작자 개인에게 부과되는 기술적 부담과 업무량은 기하급수적으로 늘어났습니다. 비디오 소스 수집부터 대본 작성, 알고리즘 분석, 광고 제안서 준비 등 창작 이외의 다양한 수동 작업에 가치 있는 시간이 소모되고 있습니다.
            </p>
          </div>

          <div className="space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-8">
            <p>
              운영사인 shortspack.com은 소프트웨어 기술이 창작자의 생산성을 어떻게 극대화할 수 있는지 고민합니다. 기술적 복잡함은 우리가 해결하고, 사용자는 오직 창의적인 콘텐츠에만 집중할 수 있는 생태계를 만드는 것이 목표입니다.
            </p>
            <p>
              우리는 인공지능(AI)과 자동화 도구를 융합하여 크리에이터 비즈니스의 모든 프로세스를 매끄럽게 연결합니다. 기술을 통해 1인 미디어와 독립 창작자들이 단순 반복 업무에서 해방되어, 더욱 고부가가치의 창의적 기획과 독창적인 스토리텔링에 집중할 수 있도록 지속 가능한 기술 인프라를 만듭니다.
            </p>
          </div>

          <div className="space-y-2 border-t border-zinc-200 dark:border-zinc-800 pt-8">
            <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">
              Developer Info
            </p>
            <p className="font-bold text-zinc-900 dark:text-white">
              Shortspack Pro | 소프트웨어 교육 및 크리에이터 도구 개발사
            </p>
            <p className="text-sm">
              우리는 소프트웨어 기술이 지닌 실용성과 교육적 가치를 결합하여, 실생활의 실질적인 문제를 소프트웨어로 해결해 나가는 것을 지향합니다.
            </p>
          </div>

          {/* 운영 주체 정보 섹션 (EEAT) */}
          <div className="space-y-3 border-t border-zinc-200 dark:border-zinc-800 pt-8 text-left">
            <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-bold">
              운영 주체 정보 (EEAT)
            </p>
            <div className="bg-zinc-100/60 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 space-y-2.5 text-sm text-zinc-650 dark:text-zinc-350">
              <div className="flex items-center gap-3">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 min-w-[70px]">운영자</span>
                <span className="text-zinc-900 dark:text-zinc-100">김성근</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 min-w-[70px]">문의</span>
                <a href={`mailto:${email}`} className="text-violet-600 dark:text-violet-400 hover:underline font-mono">{email}</a>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 min-w-[70px] mt-0.5">목적</span>
                <span className="text-zinc-900 dark:text-zinc-100">크리에이터 기술 지원 및 툴 제공</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact and Actions */}
        <section className="w-full max-w-sm space-y-4">
          <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/80 flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Mail className="w-5 h-5" />
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-zinc-650 dark:text-zinc-350">
                문의사항은 언제든 환영합니다: <strong className="font-mono">{email}</strong>
              </p>
            </div>

            <div className="flex w-full gap-2 mt-2">
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

        {/* Contact Us Section for EEAT */}
        <section className="w-full max-w-xl border-t border-zinc-200 dark:border-zinc-800 pt-8 text-center space-y-2">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">[Contact Us]</h3>
          <p className="text-zinc-650 dark:text-zinc-400 text-sm font-semibold">
            비즈니스 및 제휴 문의: <a href="mailto:contact@shortspack.com" className="text-violet-600 dark:text-violet-400 hover:underline">contact@shortspack.com</a>
          </p>
        </section>
      </main>

      <div className="bg-white dark:bg-[#060609] border-t border-zinc-200 dark:border-zinc-900">
        <Footer />
      </div>
    </div>
  );
}

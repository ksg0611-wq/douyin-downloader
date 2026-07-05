"use client";

import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToolSubNav from "@/components/tools/ToolSubNav";
import { MousePointerClick, Copy, CheckCircle2 } from "lucide-react";

type Purpose = "follow" | "comment" | "link" | "share";
type Flavor = "mild" | "spicy";

const CTA_DATA: Record<Purpose, Record<Flavor, string[]>> = {
  follow: {
    mild: [
      "앞으로도 도움 되는 꿀팁을 가장 먼저 받아보고 싶다면 팔로우해 주세요!",
      "매일 올라오는 마케팅 인사이트를 놓치지 않으려면 팔로우 버튼을 눌러주세요.",
      "더 많은 유익한 정보가 준비되어 있습니다. 제 계정을 팔로우하고 확인해 보세요."
    ],
    spicy: [
      "이 영상 넘기면 다신 못 찾습니다. 지금 당장 팔로우하고 저장해두세요!",
      "남들 다 아는 정보 나만 모르면 손해죠? 구독 버튼 안 누르면 평생 후회합니다.",
      "경쟁자는 이미 팔로우했습니다. 뒤처지기 싫다면 지금 바로 팔로우하세요."
    ]
  },
  comment: {
    mild: [
      "여러분의 생각은 어떠신가요? 댓글로 자유롭게 의견을 남겨주세요.",
      "이 중에서 가장 마음에 드는 방법은 무엇인가요? 댓글로 공유해 주세요!",
      "궁금한 점이 있다면 언제든 댓글로 질문해 주세요. 친절히 답변해 드리겠습니다."
    ],
    spicy: [
      "솔직히 이거 반박할 수 있는 분? 있으면 당장 댓글로 달아보세요.",
      "이 영상을 보고도 아무 생각이 안 든다면 심각한 겁니다. 당장 당신의 생각을 댓글로 남기세요.",
      "댓글창에 '필요해요' 한 마디만 남겨주시면 시크릿 자료 디엠으로 쏩니다."
    ]
  },
  link: {
    mild: [
      "더 자세한 내용이 궁금하다면 제 프로필 링크를 확인해 주세요.",
      "본문에 언급된 무료 자료는 프로필 하단 링크에서 다운로드하실 수 있습니다.",
      "자세한 커리큘럼은 제 바이오에 있는 링크를 클릭하시면 볼 수 있습니다."
    ],
    spicy: [
      "무료 나눔 이벤트 딱 24시간 후 마감합니다. 지금 당장 프로필 링크 클릭하세요!",
      "언제 유료로 전환될지 모릅니다. 링크 막히기 전에 프로필로 달려가세요.",
      "돈 주고도 못 구하는 자료입니다. 지금 바로 프로필 링크 클릭해서 낚아채세요."
    ]
  },
  share: {
    mild: [
      "이 정보가 필요한 친구나 동료가 있다면 영상 우측 하단 공유하기를 눌러주세요.",
      "나중에 다시 꺼내보고 싶다면 오른쪽 저장 버튼(북마크)을 눌러 보관해 보세요.",
      "도움이 되셨다면 주변 지인들에게 널리 공유해 주시면 큰 힘이 됩니다."
    ],
    spicy: [
      "지금 당장 단톡방에 공유하세요. 혼자만 알기엔 너무 아까운 특급 기밀입니다.",
      "저장 안 해두면 나중에 찾다가 날밤 샙니다. 지금 우측 버튼 누르고 당장 저장하세요!",
      "이 영상 저장해두고 내일 당장 써먹으세요. 조회수 폭발하는 거 장담합니다."
    ]
  }
};

export default function CtaWizardPage() {
  const [purpose, setPurpose] = useState<Purpose>("follow");
  const [flavor, setFlavor] = useState<Flavor>("spicy");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const currentList = CTA_DATA[purpose][flavor];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-50 text-zinc-800 dark:bg-[#060609] dark:text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-white transition-colors duration-300">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Header />
      <ToolSubNav />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 pb-12 z-10 space-y-8">
        <div className="text-center space-y-3 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center border border-orange-100 dark:border-orange-500/20 shadow-sm">
              <MousePointerClick className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white mt-4">
            행동 유도(CTA) 멘트 마법사
          </h1>
          <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            단순 시청을 넘어 팔로우, 댓글 참여, 프로필 링크 클릭 등 시청자의 확실한 행동과 전환을 이끌어내는 목적별 맞춤형 엔딩 멘트를 추천합니다.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
          
          {/* Purpose Filter */}
          <div>
            <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-3">1. 전환 목적 선택</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: "follow", label: "팔로우 유도" },
                { id: "comment", label: "댓글 참여" },
                { id: "link", label: "프로필 링크" },
                { id: "share", label: "저장 / 공유" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPurpose(p.id as Purpose)}
                  className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border ${
                    purpose === p.id
                      ? "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
                      : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Flavor Filter */}
          <div>
            <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-3">2. 멘트 톤앤매너 (맛 선택)</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFlavor("mild")}
                className={`py-2 px-5 rounded-xl text-sm font-bold transition-all border ${
                  flavor === "mild"
                    ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900 shadow-md"
                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                🌿 순한맛 (신뢰/이성형)
              </button>
              <button
                onClick={() => setFlavor("spicy")}
                className={`py-2 px-5 rounded-xl text-sm font-bold transition-all border ${
                  flavor === "spicy"
                    ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                🔥 매운맛 (도발/FOMO형)
              </button>
            </div>
          </div>

          <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full" />

          {/* Results List */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mb-2">✨ 추천 CTA 멘트 결과</h3>
            {currentList.map((text, idx) => (
              <div 
                key={idx} 
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 transition-colors hover:border-orange-500/30 dark:hover:border-orange-500/30"
              >
                <p className="text-sm text-zinc-700 dark:text-zinc-300 font-bold leading-relaxed flex-1">
                  "{text}"
                </p>
                <button
                  onClick={() => handleCopy(text, idx)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                    copiedIndex === idx
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                      : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 dark:bg-zinc-950 dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  {copiedIndex === idx ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedIndex === idx ? "복사됨!" : "복사하기"}
                </button>
              </div>
            ))}
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}

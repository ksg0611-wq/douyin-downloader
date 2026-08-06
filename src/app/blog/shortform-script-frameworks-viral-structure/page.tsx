import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import React from "react";

export const metadata: Metadata = {
  title: "2026 숏폼 떡상 대본 스크립트 프레임워크 5선 | ShortsPack Pro",
  description: "시청 지속시간(Retention)을 보장하는 5가지 대본 구조 공식, 3초 후킹 텍스트 배치법, 본문 몰입 구조 및 영상 끝 CTA 댓글 유도 대본 작성법을 완전 정리했습니다.",
  openGraph: {
    title: "2026 숏폼 떡상 대본 스크립트 프레임워크 5선 (3초 후킹→몰입→댓글 유도)",
    description: "3초 후킹부터 결말 CTA까지 이어지는 5가지 숏폼 대본 구조 공식으로 Retention을 극대화하는 법.",
    url: "https://shortspack.com/blog/shortform-script-frameworks-viral-structure",
    type: "article",
  },
};

export default function ScriptFrameworksGuide() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#060609] dark:text-zinc-100 font-sans flex flex-col">
      <Header />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-12 md:py-20 z-10">
        <article className="space-y-8">
          <header className="space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
            <div className="text-teal-500 font-bold tracking-wider text-sm uppercase">Scripting & Strategy</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
              2026 숏폼 떡상 대본 스크립트 프레임워크 5선: 3초 후킹 → 몰입 → 댓글 유도 연쇄 구조
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              작성일: 2026년 8월 6일 • 읽는 시간: 약 13분
            </p>
          </header>

          <section className="space-y-6 text-zinc-700 dark:text-zinc-300 leading-loose">

            <p>
              아무리 촬영 기술이 뛰어나도, 조명이 완벽해도, 편집이 화려해도 <strong>대본(Script)이 약하면 숏폼은 절대 터지지 않습니다.</strong> 알고리즘이 영상을 폭발적으로 밀어주는 순간은, 시청자가 처음 3초를 넘기고, 영상 내내 화면을 떠나지 않고, 영상이 끝난 후 댓글을 남기고 공유하는 일련의 행동이 연속으로 발생할 때입니다. 이 흐름을 의도적으로 설계하는 것이 바로 <strong>대본 프레임워크(Script Framework)</strong>입니다. 이 글에서는 2026년 기준 가장 높은 Retention과 인게이지먼트를 만들어내는 5가지 검증된 숏폼 대본 구조를 해부합니다.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10">핵심 원리: 모든 프레임워크에 적용되는 3단 구조</h2>
            <p>
              5가지 프레임워크는 표현 방식이 다르지만, 공통적으로 3단계 심리 흐름을 공유합니다.
            </p>
            <ol className="list-decimal pl-6 space-y-2 font-semibold bg-teal-50 dark:bg-teal-900/10 p-6 rounded-xl border border-teal-200 dark:border-teal-500/20 my-4">
              <li className="text-teal-900 dark:text-teal-200">후킹 (0~3초): 시청자가 스크롤을 멈추게 만드는 충격 또는 공감</li>
              <li className="text-teal-900 dark:text-teal-200">몰입 (4초~종료 5초 전): 약속한 정보를 제공하며 이탈을 막는 서사</li>
              <li className="text-teal-900 dark:text-teal-200">CTA (마지막 5초): 댓글·공유·저장·구독 중 하나의 행동을 유도하는 클로징</li>
            </ol>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10">프레임워크 1: AIDA 구조 (Attention → Interest → Desire → Action)</h2>
            <p>
              마케팅의 고전 공식을 숏폼에 최적화한 버전입니다. 정보 전달형·리뷰형 콘텐츠에 가장 잘 맞습니다.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>A (Attention, 0~3초):</strong> "이거 모르면 유튜브 쇼츠로 절대 못 삽니다."</li>
              <li><strong>I (Interest, 4~20초):</strong> "지금부터 알려드릴 3가지 방법은 알고리즘이 영상을 먼저 밀어주는 숨겨진 트리거입니다."</li>
              <li><strong>D (Desire, 21~40초):</strong> "실제 이 방법을 쓴 크리에이터는 2주 만에 구독자 1만 명을 달성했습니다."</li>
              <li><strong>A (Action, 마지막 5초):</strong> "여러분도 써보셨나요? 효과 있었던 방법 댓글로 알려주세요!"</li>
            </ul>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10">프레임워크 2: PAS 구조 (Problem → Agitation → Solution)</h2>
            <p>
              시청자의 고통 포인트(Pain Point)를 건드려 공감을 유발한 뒤 해결책을 제시하는 구조입니다. 자기계발, 재테크, 다이어트, 영어 공부 등 <strong>'문제 해결' 카테고리</strong>에서 압도적으로 잘 작동합니다.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>P (Problem, 0~5초):</strong> "영상 올릴 때마다 조회수 500에서 멈추는 분들 손!"</li>
              <li><strong>A (Agitation, 6~25초):</strong> "이렇게 되면 알고리즘이 이미 당신 채널을 저퀄리티로 분류한 겁니다. 그냥 두면 6개월 뒤에도 똑같습니다."</li>
              <li><strong>S (Solution, 26~55초):</strong> "딱 이것 하나만 바꾸면 됩니다. 바로 첫 3초 자막 위치를 [구체적 방법]으로..."</li>
              <li><strong>CTA:</strong> "혹시 다른 방법 쓰시는 분 있으면 댓글로 공유해주세요!"</li>
            </ul>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10">프레임워크 3: 결과 선공개 구조 (Result-First Framework)</h2>
            <p>
              영상 맨 처음에 '결과물'을 먼저 보여주고, 그 과정을 역순으로 설명하는 구조입니다. 요리, DIY, 운동 변신, 인테리어 등 <strong>비포/애프터가 명확한 콘텐츠</strong>에 최적입니다.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Result (0~3초):</strong> 완성된 결과물을 가장 먼저 보여줌 (시청자의 호기심 → "이거 어떻게 한 거야?")</li>
              <li><strong>Process (4초~종료 5초 전):</strong> A → B → C 단계별 과정을 빠른 컷으로 보여줌</li>
              <li><strong>CTA:</strong> "전 과정 풀버전은 저장해두고 따라해 보세요!"</li>
            </ul>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10">프레임워크 4: 공감-반전 구조 (Relatable Twist Framework)</h2>
            <p>
              시청자가 공감하는 흔한 상황을 묘사한 뒤, 예상을 완전히 뒤엎는 반전을 주는 구조입니다. 일상 브이로그, 유머, 사회 비판 콘텐츠에 효과적이며 <strong>저장율과 공유율이 가장 높은 포맷</strong>입니다.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>공감 유발 (0~10초):</strong> "카페에서 공부 잘 된다는 사람 진짜 인정 못함 (심각 공감 표정)"</li>
              <li><strong>반전 (11~35초):</strong> "근데 있잖아요... 저도 카페에서는 공부 진짜 잘 됩니다. 왜냐면 [예상 밖의 이유]"</li>
              <li><strong>CTA:</strong> "공감하면 좋아요, 비공감이면 댓글에 욕 남겨주세요ㅋㅋ"</li>
            </ul>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10">프레임워크 5: 숫자 나열 구조 (Listicle Framework)</h2>
            <p>
              "TOP 5", "3가지 꿀팁", "7가지 실수" 처럼 숫자를 활용해 시청자에게 <strong>'이 영상을 끝까지 보면 N개의 정보를 얻는다'</strong>는 명확한 기댓값을 제시하는 구조입니다. 완주율(Completion Rate)이 구조적으로 높아지는 가장 안정적인 포맷입니다.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>후킹 (0~3초):</strong> "숏폼 알고리즘이 영상을 밀어주는 진짜 조건 5가지"</li>
              <li><strong>중간 빌드업:</strong> 중간에 "4번이 진짜 핵심입니다" 또는 "마지막 5번은 대부분이 모릅니다"와 같은 예고 멘트 삽입 → 이탈 방지</li>
              <li><strong>CTA:</strong> "여러분은 몇 개나 알고 계셨나요? 댓글로 번호 남겨주세요!"</li>
            </ul>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10">요약: 대본은 공식이다 — 외워서 써라</h2>
            <p>
              창의성은 중요하지만, 숏폼 알고리즘을 이기는 것은 <strong>반복 가능한 공식(Repeatable Formula)</strong>입니다. 위 5가지 프레임워크를 각각 3편씩 직접 촬영해 어떤 포맷이 내 채널과 내 시청자에게 가장 잘 맞는지 데이터로 검증하세요. ShortsPack Pro의 <a href="/hook-generator" className="text-teal-500 hover:underline">AI 후킹 문구 생성기</a>와 <a href="/tools/script-framework" className="text-teal-500 hover:underline">대본 프레임워크 도구</a>를 활용하면 각 구조에 맞는 대본 초안을 몇 초 만에 완성할 수 있습니다.
            </p>

          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}

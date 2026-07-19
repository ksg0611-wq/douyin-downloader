import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import React from "react";

export const metadata: Metadata = {
  title: "인공지능(AI)으로 떡상하는 쇼츠 대본 10배 빠르게 양산하는 프롬프트 가이드 | ShortsPack Pro",
  description: "챗GPT와 제미나이를 활용해 떡상하는 숏폼 대본을 10배 빠르게 양산하는 완벽 프롬프트 엔지니어링 가이드. 3초 후킹부터 알고리즘 맞춤형 포맷까지 전부 공개합니다.",
  openGraph: {
    title: "AI로 쇼츠 대본 10배 빠르게 양산하는 프롬프트 가이드",
    description: "더 이상 대본 작성에 밤새지 마세요. AI를 마법처럼 부리는 프롬프트 공식을 소개합니다.",
    url: "https://shortspack.com/blog/ai-shorts-script-guide",
    type: "article",
  },
};

export default function AIScriptGuidePage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#060609] dark:text-zinc-100 font-sans flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-12 md:py-20 z-10">
        <article className="space-y-8">
          <header className="space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
            <div className="text-purple-500 font-bold tracking-wider text-sm uppercase">AI & Prompt Engineering</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
              인공지능(AI)으로 떡상하는 쇼츠 대본 10배 빠르게 양산하는 프롬프트 가이드
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              작성일: 2026년 7월 19일 • 읽는 시간: 약 10분
            </p>
          </header>

          <section className="space-y-6 text-zinc-700 dark:text-zinc-300 leading-loose">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10">1. AI를 썼는데 왜 내 쇼츠는 안 터질까?</h2>
            <p>
              "챗GPT한테 쇼츠 대본 써달라고 했더니 너무 로봇 같아서 쓸 수가 없어요." 크리에이터들이 가장 많이 하는 하소연입니다. '요즘 뜨는 다이어트 꿀팁으로 쇼츠 대본 써줘'라고 단순히 1줄짜리 프롬프트를 입력하면, 인공지능은 2010년 블로그에서나 볼 법한 지루하고 평범한 글(예: "안녕하세요 여러분! 오늘은 다이어트에 대해 알아볼게요~")을 뱉어냅니다. 
            </p>
            <p>
              숏폼 알고리즘은 <strong>첫 3초의 폭발적인 후킹</strong>, 중간 이탈을 막는 <strong>빠른 호흡(Pacing)</strong>, 그리고 <strong>강력한 시각적 전환</strong>을 요구합니다. AI에게 대본을 맡길 때는 텍스트만 뱉어내게 해서는 안 됩니다. 카메라 무빙, BGM 분위기, 시각적 자료(B-Roll)의 배치까지 모두 지시하는 '마스터 프롬프트(Master Prompt)'를 설계해야만 진정한 공장화(Factory)가 가능해집니다.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10">2. 쇼츠 대본용 마스터 프롬프트 3대 핵심 요소</h2>
            <p>
              성공적인 프롬프트 엔지니어링을 위해서는 AI에게 명확한 '페르소나'와 '제약 조건'을 부여해야 합니다. 다음 3가지를 프롬프트 최상단에 고정하십시오.
            </p>
            
            <h3 className="text-xl font-bold mt-6 mb-2">A. 역할 부여 (Persona)</h3>
            <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl font-mono text-sm border border-zinc-200 dark:border-zinc-800">
              "너는 지금부터 구독자 100만 명을 보유한 틱톡커이자 숏폼 전문 카피라이터야. Z세대의 트렌디한 말투를 사용하고, 절대로 '안녕하세요, 오늘은~' 같은 진부한 오프닝을 쓰지 마."
            </div>

            <h3 className="text-xl font-bold mt-6 mb-2">B. 구조적 제약 (Structure & Constraints)</h3>
            <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl font-mono text-sm border border-zinc-200 dark:border-zinc-800">
              "총길이는 45초 분량(약 120~150단어)으로 맞춰줘. 문장은 무조건 단문으로 짧게 치고, 초반 3초에 시청자의 멱살을 잡을 수 있는 파격적인 질문이나 결과를 먼저 제시해."
            </div>

            <h3 className="text-xl font-bold mt-6 mb-2">C. 다차원 포맷 (Multi-dimensional Format)</h3>
            <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl font-mono text-sm border border-zinc-200 dark:border-zinc-800">
              "결과물은 단순 줄글이 아니라 표(Table) 형태로 출력해 줘. 열(Column) 구성은 [초(Time) / 화면 연출(Visual) / 나레이션 대사 / BGM 및 효과음] 으로 나눠서 시각적으로 바로 편집할 수 있게 만들어줘."
            </div>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10">3. 실전 프롬프트 템플릿: 정보 전달형(Info-tainment) 숏폼</h2>
            <p>
              위의 3가지 요소를 결합한 실전 프롬프트 복붙(Copy & Paste) 템플릿입니다. 괄호 `[ ]` 안의 내용만 여러분의 주제로 바꿔서 ChatGPT(GPT-4)나 Claude 3, Gemini에 입력해 보십시오.
            </p>
            
            <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-xl border border-purple-200 dark:border-purple-500/20 my-6 whitespace-pre-line text-sm text-purple-900 dark:text-purple-200">
              {`역할: 너는 천재적인 바이럴 마케터이자 숏폼 PD야.
주제: [다이소에서 무조건 사야 하는 숨겨진 꿀템 3가지]

조건 1. 오프닝 3초는 논란을 일으키거나 압도적인 호기심을 유발하는 Hook으로 시작할 것. (예: "이걸 아직도 안 샀다고요?")
조건 2. 본론은 3가지 아이템을 속도감 있게 전달할 것. 1문장당 3초를 넘지 않게 할 것.
조건 3. 엔딩은 무조건 "저장해두고 나중에 꼭 사세요"라는 CTA(Call to Action)로 마무리할 것.
조건 4. 출력 형식은 마크다운 표(Table)를 사용할 것. 
열 구성: | 타임라인 | 시각적 화면(B-Roll) | 자막/대사 | 효과음 |`}
            </div>
            <p>
              이 프롬프트를 실행하면 AI는 단순히 글을 쓰는 것을 넘어, 편집자가 컷 편집을 할 때 어떤 자료화면을 넣어야 할지, 어느 타이밍에 '휙' 하는 효과음을 넣어야 할지 완벽하게 기획된 스토리보드를 3초 만에 생성해 냅니다.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10">4. AI 대본의 '감정(Emotion)' 한 끗 차이 살리기</h2>
            <p>
              AI가 짜준 완벽한 스토리보드를 그대로 읽기만 한다면 여전히 기계적인 느낌을 지울 수 없습니다. 마지막으로 여러분이 직접 10%의 '인간적인 감정'을 덧칠해야 합니다.
            </p>
            <ul className="list-disc pl-6 space-y-3 font-semibold mt-4">
              <li><strong>슬랭과 추임새 추가:</strong> AI는 '대박입니다'라고 씁니다. 여러분은 이걸 '와, 미쳤습니다 진짜'로 수정해야 합니다.</li>
              <li><strong>호흡 끊어 읽기 표기:</strong> 대본 중간에 슬래시(/)나 줄바꿈을 과장되게 넣어 녹음할 때 숨을 헐떡이거나 급박한 느낌을 주도록 표기하십시오. 숏폼은 오디오의 템포(Tempo)가 몰입도를 좌우합니다.</li>
            </ul>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10">5. 결론: AI는 조수일 뿐, 디렉팅은 당신의 몫입니다</h2>
            <p>
              쇼츠 대본을 하루에 10개씩 양산하는 상위 1% 크리에이터들은 머리를 싸매고 글을 쓰지 않습니다. 그들은 <strong>'어떤 프롬프트를 입력해야 최상의 재료가 나오는지'</strong>를 연구하는 프롬프트 엔지니어이자 디렉터입니다. 
            </p>
            <p>
              오늘 당장 이 가이드에 있는 마스터 프롬프트를 활용해 1주일 치 대본을 1시간 만에 뽑아내 보십시오. ShortsPack Pro의 <strong>'3초 후킹 대본 생성기'</strong>나 <strong>'바이럴 역설계기'</strong> 툴을 함께 활용한다면, 인공지능이 가져다주는 생산성의 폭발을 즉각적으로 경험하실 수 있을 것입니다.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}

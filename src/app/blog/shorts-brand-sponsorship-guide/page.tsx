import { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import React from "react";

export const metadata: Metadata = {
  title: "숏폼 크리에이터 브랜드 협찬 단가 산정법과 성공적인 제안서 작성법 | ShortsPack Pro",
  description: "내 채널의 진짜 가치는 얼마일까? 유튜브 쇼츠, 인스타그램 릴스 조회수를 기반으로 한 현실적인 브랜드 협찬(PPL) 단가 산정 공식과 콜드메일 제안서 꿀팁을 대공개합니다.",
  openGraph: {
    title: "숏폼 크리에이터 브랜드 협찬 단가 산정법과 성공적인 제안서 작성법",
    description: "내 채널의 몸값을 2배로 올리는 협찬 단가 공식과 마케터의 마음을 훔치는 제안서 작성 가이드.",
    url: "https://shortspack.com/blog/shorts-brand-sponsorship-guide",
    type: "article",
  },
};

export default function SponsorshipGuidePage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#060609] dark:text-zinc-100 font-sans flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-12 md:py-20 z-10">
        <article className="space-y-8">
          <header className="space-y-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
            <div className="text-emerald-500 font-bold tracking-wider text-sm uppercase">Business & Sponsorship</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
              숏폼 크리에이터 브랜드 협찬 단가 산정법과 성공적인 제안서 작성법 (RPM & 조회수 기준)
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              작성일: 2026년 7월 21일 • 읽는 시간: 약 9분
            </p>
          </header>

          <section className="space-y-6 text-zinc-700 dark:text-zinc-300 leading-loose">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10">1. 내 채널의 광고 단가, 얼마를 불러야 적당할까?</h2>
            <p>
              "협찬 문의가 들어왔는데 도대체 얼마를 불러야 할지 모르겠어요." 구독자 1만 명에서 10만 명 구간을 지나는 숏폼 크리에이터들이 가장 많이 겪는 딜레마입니다. 너무 비싸게 부르면 브랜드 마케터가 도망갈 것 같고, 너무 싸게 부르면 호구가 될 것 같아 협상 테이블에서 항상 끌려다니기 마련입니다.
            </p>
            <p>
              과거 롱폼 유튜브 시절에는 '구독자 수 × 10원'이라는 주먹구구식 공식이 통용되었습니다. 하지만 알고리즘 추천 기반의 쇼츠(Shorts)와 릴스(Reels) 생태계에서 <strong>구독자 수는 철저히 무의미합니다.</strong> 오로지 **최근 30일간의 평균 조회수(View Count)**와 **채널의 핵심 카테고리(Niche)**만이 여러분의 몸값을 결정합니다. 이 글에서는 2026년 기준 현업 마케팅 대행사들이 실제로 사용하는 '숏폼 협찬 단가 산정 공식'을 투명하게 공개합니다.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10">2. 2026년 최신 숏폼 브랜드 협찬 단가 공식 (CPV 모델)</h2>
            <p>
              광고주가 지불하는 비용은 철저하게 CPV(Cost Per View, 1회 조회당 비용) 모델로 수렴합니다. 쇼츠와 릴스의 평균적인 브랜디드 콘텐츠 CPV는 카테고리에 따라 **10원 ~ 30원** 사이로 형성되어 있습니다.
            </p>
            
            <h3 className="text-xl font-bold mt-6 mb-2">A. 1단계: 내 채널의 '평균 보장 조회수' 도출</h3>
            <p>
              우연히 알고리즘을 타고 떡상한 500만 뷰 영상 1개는 기준에서 제외해야 합니다. 가장 최근 업로드한 10개의 영상 중, 최고 조회수 1개와 최저 조회수 1개를 제외한 <strong>나머지 8개 영상의 평균 조회수</strong>가 바로 여러분의 '보장 조회수'입니다. 만약 이 평균이 5만 뷰라면, 그것이 광고주에게 팔 수 있는 여러분의 진짜 트래픽입니다.
            </p>

            <h3 className="text-xl font-bold mt-6 mb-2">B. 2단계: 카테고리별 CPV 가중치 곱하기</h3>
            <ul className="list-disc pl-6 space-y-3 font-semibold mt-4 bg-zinc-100 dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <li><strong>엔터테인먼트 / 코미디 / 댄스 챌린지:</strong> CPV 10원 ~ 15원. (조회수는 높지만 구매 전환율이 낮기 때문)</li>
              <li><strong>뷰티 / 패션 / 푸드:</strong> CPV 15원 ~ 20원. (트렌드에 민감하고 즉각적인 소비로 이어짐)</li>
              <li><strong>IT 기기 / 자동차 / 경제·금융:</strong> CPV 25원 ~ 35원. (광고주 제품 객단가가 매우 높고, 시청자의 구매 의도가 명확함)</li>
            </ul>
            <p>
              <strong>[계산 예시]</strong> IT 기기 리뷰 채널의 평균 조회수가 5만 뷰일 때: <code>50,000뷰 × 30원 = 1,500,000원</code>. 즉, 이 크리에이터는 1건의 브랜디드 영상 제작비로 150만 원을 당당하게 요구할 수 있습니다. 이것이 기준점입니다.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10">3. 가치를 2배로 부풀리는 '패키지 딜(Package Deal)' 전략</h2>
            <p>
              단순히 영상 1편을 만들어 올리는 것으로 끝내지 마십시오. 기업 마케터들은 본인들의 노력을 덜어주는 '올인원' 솔루션에 기꺼이 추가 예산을 집행합니다.
            </p>
            <ul className="list-disc pl-6 space-y-3 mt-4">
              <li><strong>2차 활용 권리(Licensing) 부여:</strong> "저희 채널에 업로드하는 것 외에도, 브랜드 공식 인스타그램이나 자사몰에서 이 영상을 3개월 동안 광고 소재로 자유롭게 쓰셔도 좋습니다. 대신 단가에 30%를 추가하겠습니다." 이는 마케터에게 엄청난 매력으로 다가옵니다.</li>
              <li><strong>크로스 플랫폼 업로드:</strong> "유튜브 쇼츠 업로드 단가는 150만 원이지만, 제 틱톡과 인스타그램 릴스에도 동시 업로드하여 노출을 극대화해 드리는 패키지로 진행 시 총 200만 원에 맞춰 드리겠습니다." 플랫폼 확장은 단가를 높이는 가장 쉬운 레버리지입니다.</li>
            </ul>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10">4. 마케터의 마음을 훔치는 콜드 메일(제안서) 작성법</h2>
            <p>
              앉아서 협찬 문의가 오기만을 기다리는 것은 하수입니다. 여러분의 채널과 결이 맞는 브랜드를 찾았다면 직접 콜드 메일을 보내 영업해야 합니다. 이때 장황한 자기소개는 쓰레기통으로 직행합니다. 마케터가 3초 만에 여러분을 선택하게 만드는 제안서의 핵심은 <strong>'데이터'와 '기획안'</strong>입니다.
            </p>
            
            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-xl border border-emerald-200 dark:border-emerald-500/20 my-6 whitespace-pre-line text-sm text-emerald-900 dark:text-emerald-200">
              {`[실전 제안서 템플릿]
제목: [제안] 귀사의 신제품(O) 타겟 마케팅을 위한 숏폼 콜라보레이션 제안 (평균 10만 뷰 채널 OOO)

마케팅 담당자님 안녕하세요,
저는 최근 귀사의 타겟층인 [2030 직장인]을 대상으로 월평균 [300만] 뷰 트래픽을 발생시키고 있는 크리에이터 OOO입니다.

이번에 출시된 귀사의 신제품을 살펴보니 제 구독자층의 니즈와 완벽히 일치한다고 판단되어 먼저 콜라보를 제안드립니다.
단순 리뷰가 아닌, 제 채널에서 가장 바이럴 터졌던 [특정 포맷]을 차용하여 아래와 같은 3가지 기획안을 준비했습니다.

[기획안 A]: 3초 후킹을 강조한 스킷 코미디 형태
[기획안 B]: 실사용 Before & After를 극대화한 리뷰 형태

첨부해 드린 채널 포트폴리오(성별/연령 데이터 포함)를 검토해 보시고 긍정적인 회신 주시면, 즉시 예산표와 상세 스토리보드를 전달해 드리겠습니다. 감사합니다.`}
            </div>
            <p>
              이처럼 뜬구름 잡는 소리가 아닌 구체적인 타겟 트래픽과 미리 준비된 기획안 2가지를 들이미는 크리에이터를 거절할 마케터는 없습니다.
            </p>

            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10">5. 결론: 나만의 영업 사원 AI 활용하기</h2>
            <p>
              단가를 계산하고 제안서를 작성하는 과정이 막막하게 느껴진다면, ShortsPack Pro의 <strong>'크리에이터 예상 수익 계산기'</strong>와 <strong>'브랜드 협찬(광고) 제안서 자동 생성기'</strong>를 적극 활용하십시오. 조회수와 카테고리만 입력하면 객관적인 시장 단가를 즉시 시뮬레이션해 주고, 타겟 브랜드의 이름만 입력하면 마케터의 마음을 사로잡을 정밀한 비즈니스 콜드 메일 초안을 10초 만에 생성해 줍니다. 
            </p>
            <p>
              크리에이터는 창작자이자 곧 1인 기업입니다. 훌륭한 콘텐츠를 만드는 것만큼이나, 내 가치를 정당하게 평가받고 세일즈하는 능력을 갖춰 압도적인 수익을 창출하시길 바랍니다.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}

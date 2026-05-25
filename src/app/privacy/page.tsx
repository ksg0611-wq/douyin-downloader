import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col">
      <Header theme="light" />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-12 md:py-20 z-10">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 mb-8 border-b border-zinc-200 pb-4">
          개인정보처리방침
        </h1>

        <div className="space-y-8 text-zinc-700 leading-relaxed text-sm md:text-base">
          <p>
            Douyin Downloader(이하 '회사')은(는) 이용자의 개인정보를 중요시하며, "정보통신망 이용촉진 및 정보보호 등에 관한 법률" 및 "개인정보보호법"을 준수하고 있습니다. 회사는 개인정보처리방침을 통하여 이용자가 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900">1. 수집하는 개인정보 항목</h2>
            <p>
              회사는 별도의 회원가입 없이 서비스를 이용할 수 있으나, 서비스 이용 과정에서 아래와 같은 정보들이 자동으로 생성되어 수집될 수 있습니다.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>수집 항목: 접속 IP 정보, 쿠키, 방문 일시, 서비스 이용 기록, 브라우저 종류 및 OS</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900">2. 개인정보의 수집 및 이용 목적</h2>
            <p>회사는 수집한 정보를 다음의 목적을 위해 활용합니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>서비스 제공에 따른 콘텐츠 제공 및 시스템 안정성 확보</li>
              <li>방문 빈도 파악 및 서비스 이용 통계 분석을 통한 서비스 개선</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900">3. 구글 애드센스(Google AdSense) 및 쿠키 사용에 대한 명시 (필수 항목)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>본 사이트는 제3자 광고 회사(Google 등)를 통해 광고를 게재합니다.</li>
              <li>구글을 포함한 제3자 판매자는 쿠키를 사용하여 이용자의 이전 웹사이트 방문 기록을 바탕으로 광고를 게재합니다.</li>
              <li>구글의 광고 쿠키 사용으로 인해 구글 및 파트너사는 이용자의 본 사이트 및 다른 사이트 방문 기록을 토대로 맞춤형 광고를 제공할 수 있습니다.</li>
              <li>이용자는 구글 광고 설정(<a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://adssettings.google.com</a>)을 방문하여 맞춤형 광고 게재를 차단할 수 있습니다.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900">4. 개인정보의 보유 및 파기</h2>
            <p>
              회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900">5. 개인정보보호책임자 및 문의</h2>
            <p>
              이용자는 회사의 서비스를 이용하시며 발생하는 모든 개인정보보호 관련 민원을 개인정보보호책임자 혹은 담당부서로 신고하실 수 있습니다.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>이메일: support@example.com</li>
              <li>시행일자: 2026년 5월 25일</li>
            </ul>
          </section>
        </div>
      </main>

      <div className="bg-white border-t border-zinc-200">
        <Footer theme="light" />
      </div>
    </div>
  );
}

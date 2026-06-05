import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col">
      <Header theme="light" />

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-12 md:py-20 z-10">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 mb-8 border-b border-zinc-200 pb-4">
          이용약관
        </h1>

        <div className="space-y-8 text-zinc-700 leading-relaxed text-sm md:text-base">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900">제 1 조 (목적)</h2>
            <p>
              본 약관은 ShortsPack Pro(이하 '회사')이 제공하는 숏폼 비디오 다운로드 및 관련 정보 서비스(이하 '서비스')의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900">제 2 조 (서비스의 이용 및 제한)</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                본 서비스는 사용자가 입력한 공개 링크의 메타데이터를 분석하여 편리한 다운로드 환경을 제공하는 도구입니다.
              </li>
              <li>
                사용자는 본 서비스를 이용하여 다운로드한 콘텐츠를 개인적인 소장 및 아카이브 목적으로만 사용해야 하며, 타인의 저작권을 침해하는 재배포, 상업적 이용 등의 행위를 해서는 안 됩니다. 저작권 침해로 인해 발생하는 모든 법적 책임은 사용자 본인에게 있습니다.
              </li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900">제 3 조 (면책조항)</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                회사는 제3자 플랫폼(Douyin 등)의 API 변경, 서버 점검, 네트워크 장애 등으로 인해 서비스가 일시적 또는 영구적으로 중단되는 것에 대해 책임을 지지 않습니다.
              </li>
              <li>
                회사는 사용자가 서비스를 이용하여 기대하는 수익을 얻지 못하거나, 서비스를 통해 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.
              </li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900">제 4 조 (관할법원)</h2>
            <p>
              본 약관과 관련하여 발생한 분쟁에 대해 소송이 제기될 경우, 회사의 본사 소재지를 관할하는 법원을 전속 관할법원으로 합니다.
            </p>
          </section>
          
          <div className="pt-4 border-t border-zinc-200 text-sm">
            <p>시행일자: 2026년 5월 25일</p>
          </div>
        </div>
      </main>

      <div className="bg-white border-t border-zinc-200">
        <Footer theme="light" />
      </div>
    </div>
  );
}

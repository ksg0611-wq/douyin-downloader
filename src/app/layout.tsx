import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shortspack.com"),
  title: "ShortsPack Pro - 글로벌 크리에이터 종합 툴박스",
  description: "도우인·샤오홍슈·틱톡·릴스 등 글로벌 숏폼 다운로더부터 AI 대본 추출, 트렌드 분석, 다국어 번역, 수익 시뮬레이터까지 아우르는 크리에이터 필수 도구 모음집",
  verification: {
    google: "a97GsPCt8lP3zBSrkbPU7uBfDBzPSmLfZV5NuCPB6j4",
    other: {
      "naver-site-verification": "a2551834a8f2b4f41d0562b20060749c260a875d",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `
          }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8195982419600082"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics gaId="G-42XDND3PGS" />
        {children}
        <Analytics />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
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
      "naver-site-verification": "f87c4bfdd6c2c459b307e132bb187186f214d872",
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
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8195982419600082"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

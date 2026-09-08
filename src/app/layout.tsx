import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { AuthContextProvider } from "@/context/AuthContext";
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
  description: "중국 숏폼(더우인·샤오홍슈) 워터마크 없는 고화질 레퍼런스 백업부터 AI 협찬 제안서, 대본 프레임워크, 트렌드 분석까지 아우르는 크리에이터 필수 도구 모음집",
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
      </head>
      <body className="min-h-full flex flex-col">
        <GoogleAnalytics gaId="G-42XDND3PGS" />
        <AuthContextProvider>
          {children}
        </AuthContextProvider>
        <Analytics />
      </body>
    </html>
  );
}

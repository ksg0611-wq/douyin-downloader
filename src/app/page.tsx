import { Suspense } from "react";
import type { Metadata } from "next";
import DownloaderClient from "@/app/downloader/DownloaderClient";

export const metadata: Metadata = {
  title: "중국 숏폼(더우인·샤오홍슈) 워터마크 없는 고화질 레퍼런스 백업 - ShortsPack Pro",
  description: "중국 숏폼(더우인·샤오홍슈) 워터마크 없는 고화질 레퍼런스 백업 도구입니다. 원본 화질 그대로 더우인과 샤오홍슈 영상을 깨끗하게 다운로드하여 벤치마킹 분석에 활용하세요.",
  alternates: {
    canonical: "https://shortspack.com",
  },
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RootPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const category = (resolvedParams.category as string) || "idea";

  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-[#060609] flex items-center justify-center text-zinc-500">대본 및 도구 보관함 로드 중...</div>}>
      <DownloaderClient initialCategory={category} />
    </Suspense>
  );
}

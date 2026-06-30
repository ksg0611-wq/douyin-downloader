import { Suspense } from "react";
import type { Metadata } from "next";
import DownloaderClient from "./DownloaderClient";

export const metadata: Metadata = {
  title: "틱톡/도우인 클린 비디오 다운로더 - ShortsPack Pro",
  description: "원본 화질 그대로 틱톡, 도우인, 릴스 영상을 고화질로 다운로드하세요. 개인 학습 및 벤치마킹을 위한 필수 도구입니다.",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DownloaderPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const category = (resolvedParams.category as string) || "idea";

  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-[#060609] flex items-center justify-center text-zinc-500">대본 및 도구 보관함 로드 중...</div>}>
      <DownloaderClient initialCategory={category} />
    </Suspense>
  );
}

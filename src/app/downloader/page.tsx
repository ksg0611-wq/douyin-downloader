import type { Metadata } from "next";
import DownloaderClient from "./DownloaderClient";

export const metadata: Metadata = {
  title: "워터마크 없는 틱톡/도우인 영상 다운로더 - ShortsPack Pro",
  description: "워터마크 없이 틱톡, 도우인, 릴스 영상을 고화질로 다운로드하세요. 개인 학습 및 벤치마킹을 위한 필수 도구입니다.",
};

export default function DownloaderPage() {
  return <DownloaderClient />;
}

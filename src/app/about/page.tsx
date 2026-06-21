import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "ShortsPack Pro 소개 및 운영자 정보",
  description: "글로벌 크리에이터의 성장을 돕는 ShortsPack Pro의 비전과 서비스 운영 원칙을 소개합니다.",
};

export default function AboutPage() {
  return <AboutClient />;
}

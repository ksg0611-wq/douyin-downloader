export interface AdData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
}

export const CPA_ADS: Record<string, AdData> = {
  main_cpa: {
    id: "ad-tenping-main",
    title: "비교원 혜택 신청하기",
    description: "인터넷 가입, 휴대폰, 가전렌탈 등 푸짐한 혜택을 비교해보세요",
    imageUrl: "http://img.tenping.kr/Content/Upload/Images/2026041618050001_Dis_20260416180549.png",
    linkUrl: "https://iryan.kr/t8glyqxiv3",
  }
};

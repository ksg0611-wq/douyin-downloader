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
  },
  download_result: {
    id: "ad-download-result",
    title: "실시간 신차 장기렌트 · 리스 비교견적 상담",
    description: "초기비용 0원으로 원하는 신차를 가장 저렴하게 이용해 보세요",
    imageUrl: "http://img.tenping.kr/Content/Upload/Images/2026052013210001_Dis_20260520132102.png",
    linkUrl: "https://iryan.kr/t8glyqwvqr",
  },
  blog_middle: {
    id: "ad-blog-middle",
    title: "실시간 신차 장기렌트 · 리스 비교견적 상담",
    description: "초기비용 0원으로 원하는 신차를 가장 저렴하게 이용해 보세요",
    imageUrl: "http://img.tenping.kr/Content/Upload/Images/2026052013210001_Dis_20260520132102.png",
    linkUrl: "https://iryan.kr/t8glyqwvqr",
  }
};

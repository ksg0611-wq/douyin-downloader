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
    title: "초고속 인터넷 가입 특별전",
    description: "최대 현금 사은품 당일 지급! 빠르고 안전한 가입",
    imageUrl: "https://placehold.co/800x400/3f3f46/ffffff?text=Internet+CPA",
    linkUrl: "#",
  },
  blog_middle: {
    id: "ad-blog-middle",
    title: "직장인을 위한 숨은 환급금 찾기",
    description: "놓치고 있던 내 환급금, 1분 만에 간편 조회하세요",
    imageUrl: "https://placehold.co/800x400/52525b/ffffff?text=Refund+CPA",
    linkUrl: "#",
  }
};

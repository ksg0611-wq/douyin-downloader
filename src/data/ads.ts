export interface AdData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
}

export const CPA_ADS: Record<string, AdData> = {
  car_finance: {
    id: "ad-car-finance",
    title: "신차 장기렌터카 특가 프로모션",
    description: "초기 비용 0원! 월 렌트료 최저가 비교 견적 받아보기",
    imageUrl: "https://placehold.co/800x400/1e293b/ffffff?text=Long-term+Rent+CPA",
    linkUrl: "https://example.com/cpa/car-rent",
  },
  insurance: {
    id: "ad-insurance",
    title: "내 보험료 숨은 할인 찾기",
    description: "다이렉트 자동차보험 비교하고 평균 15% 이상 절약하세요",
    imageUrl: "https://placehold.co/800x400/0f172a/38bdf8?text=Insurance+CPA",
    linkUrl: "https://example.com/cpa/insurance",
  },
  loan: {
    id: "ad-loan",
    title: "직장인 우대 신용대출 금리 비교",
    description: "내 한도와 금리, 단 1분 만에 안전하게 확인하세요",
    imageUrl: "https://placehold.co/800x400/312e81/818cf8?text=Finance+CPA",
    linkUrl: "https://example.com/cpa/loan",
  },
};

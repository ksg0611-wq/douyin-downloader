export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: string;
  readTime: string;
}

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: "post-1",
    title: "Douyin 영상을 활용한 쇼핑몰 매출 증대 전략",
    summary: "워터마크 없는 깨끗한 Douyin 리뷰 영상을 자사몰에 삽입하여 구매 전환율을 300% 이상 끌어올린 A/B 테스트 사례와 구체적인 적용 방법론을 다룹니다.",
    date: "2024. 05. 24",
    category: "Marketing",
    readTime: "5 min read"
  },
  {
    id: "post-2",
    title: "고단가 CPA 마케팅 실전 가이드",
    summary: "실제 트래픽을 유발하는 숏폼 콘텐츠 기획부터, 고단가 CPA 캠페인 세팅 및 트래킹 솔루션 연동까지의 전 과정을 상세히 해부합니다.",
    date: "2024. 05. 20",
    category: "Affiliate",
    readTime: "8 min read"
  },
  {
    id: "post-3",
    title: "이커머스 키워드 광고 최적화 노하우",
    summary: "검색량이 아닌 전환율(CVR) 중심의 롱테일 키워드 발굴 기법과 ROAS(광고수익률)를 극대화하는 매체별 입찰가 조정 비법을 공개합니다.",
    date: "2024. 05. 15",
    category: "E-Commerce",
    readTime: "6 min read"
  },
  {
    id: "post-4",
    title: "글로벌 숏폼 트렌드 분석: 2024년 하반기 전망",
    summary: "TikTok과 Douyin의 알고리즘 변화 추이와 이에 대응하는 브랜드 공식 채널의 운영 전략 및 오가닉 트래픽 확보 방안을 살펴봅니다.",
    date: "2024. 05. 10",
    category: "Trend",
    readTime: "4 min read"
  }
];

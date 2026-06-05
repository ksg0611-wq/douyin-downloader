import { NextResponse } from 'next/server';

// 시드 기반 결정론적 난수 생성 (같은 키워드 + 날짜 → 같은 결과)
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

// 연관 해시태그 생성 룰
const HASHTAG_THEMES: Record<string, string[]> = {
  food: ['#먹방', '#맛집', '#홈쿡', '#레시피', '#오늘뭐먹지', '#맛스타그램', '#먹스타그램', '#요리', '#베이킹', '#카페투어'],
  beauty: ['#뷰티', '#메이크업', '#스킨케어', '#글로우업', '#올리브영', '#화장품추천', '#데일리메이크업', '#언박싱', '#신상템', '#뷰티루틴'],
  fashion: ['#패션', '#오오티디', '#OOTD', '#데일리룩', '#빈티지', '#스트릿패션', '#하울', '#코디', '#쇼핑', '#트렌드'],
  travel: ['#여행', '#국내여행', '#해외여행', '#감성사진', '#힐링', '#일상', '#주말여행', '#캠핑', '#드라이브', '#뷰맛집'],
  fitness: ['#운동', '#헬스', '#다이어트', '#홈트', '#필라테스', '#요가', '#러닝', '#몸스타그램', '#건강', '#근성장'],
  lifestyle: ['#일상', '#브이로그', '#데일리', '#감성', '#인테리어', '#자취생활', '#독립', '#취미', '#독서', '#영화'],
  pet: ['#강아지', '#고양이', '#반려동물', '#댕댕이', '#냥이', '#펫스타그램', '#동물', '#귀염', '#멍스타그램', '#고냥이'],
  tech: ['#IT', '#기술', '#AI', '#앱', '#스마트폰', '#테크', '#디지털', '#혁신', '#스타트업', '#개발'],
};

function getRelatedHashtags(keyword: string, rand: () => number): string[] {
  const lower = keyword.toLowerCase();
  let pool: string[] = [];

  // 키워드 매칭으로 테마 선택
  if (/음식|먹|요리|맛|카페|레시피/.test(lower)) pool = HASHTAG_THEMES.food;
  else if (/뷰티|화장|메이크|스킨|미용/.test(lower)) pool = HASHTAG_THEMES.beauty;
  else if (/패션|옷|코디|룩|스타일/.test(lower)) pool = HASHTAG_THEMES.fashion;
  else if (/여행|travel|trip|투어/.test(lower)) pool = HASHTAG_THEMES.travel;
  else if (/운동|헬스|다이어트|핏|fit/.test(lower)) pool = HASHTAG_THEMES.fitness;
  else if (/강아지|고양이|반려|pet|dog|cat/.test(lower)) pool = HASHTAG_THEMES.pet;
  else if (/tech|기술|ai|it|개발/.test(lower)) pool = HASHTAG_THEMES.tech;
  else pool = HASHTAG_THEMES.lifestyle;

  // 풀에 키워드 자체와 변형 추가
  const keyword_tags = [
    `#${keyword.replace(/\s+/g, '')}`,
    `#${keyword.replace(/\s+/g, '')}추천`,
    `#${keyword.replace(/\s+/g, '')}트렌드`,
  ];

  const combined = [...keyword_tags, ...pool];
  // 랜덤 셔플 후 5개 선택
  const shuffled = combined.sort(() => rand() - 0.5);
  return shuffled.slice(0, 8);
}

export async function POST(request: Request) {
  try {
    const { keyword } = await request.json();

    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return NextResponse.json({ error: '키워드를 입력해 주세요.' }, { status: 400 });
    }

    const cleanKeyword = keyword.trim().slice(0, 50);
    const today = new Date();
    const dateStr = `${today.getFullYear()}${today.getMonth()}${today.getDate()}`;
    const seed = hashString(cleanKeyword + dateStr);
    const rand = seededRandom(seed);

    // ── 7일간 트렌드 데이터 생성 ──
    // 기본 베이스 볼륨 (키워드 길이, 시드 기반)
    const baseVolume = Math.floor(rand() * 800000 + 50000);
    const volatility = rand() * 0.4 + 0.1; // 변동성 10~50%

    const days: { date: string; views: number; posts: number }[] = [];
    let currentVolume = baseVolume * (0.7 + rand() * 0.3);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayLabel = `${d.getMonth() + 1}/${d.getDate()}`;

      // 트렌드 방향: 상승(0.6) / 하락(0.4)
      const trendDirection = seed % 3 === 0 ? -1 : 1;
      const dailyChange = (rand() - 0.45) * volatility * trendDirection;
      currentVolume = Math.max(
        baseVolume * 0.2,
        Math.min(baseVolume * 2.5, currentVolume * (1 + dailyChange))
      );

      // 주말 효과 (토=6, 일=0에 약간 상승)
      const dayOfWeek = d.getDay();
      const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? (1 + rand() * 0.2) : 1;

      days.push({
        date: dayLabel,
        views: Math.floor(currentVolume * weekendBoost),
        posts: Math.floor(currentVolume * weekendBoost * (0.01 + rand() * 0.04)),
      });
    }

    // ── 총 누적 게시물 수 ──
    const totalPosts =
      Math.floor(rand() * 9000000 + 100000) +
      cleanKeyword.length * Math.floor(rand() * 50000);

    // ── 경쟁 강도 계산 ──
    const competitionScore = rand();
    let competition: '상' | '중' | '하';
    let competitionEn: 'High' | 'Medium' | 'Low';
    let competitionColor: string;
    if (competitionScore > 0.66) {
      competition = '상';
      competitionEn = 'High';
      competitionColor = 'rose';
    } else if (competitionScore > 0.33) {
      competition = '중';
      competitionEn = 'Medium';
      competitionColor = 'amber';
    } else {
      competition = '하';
      competitionEn = 'Low';
      competitionColor = 'emerald';
    }

    // ── 트렌드 지수 (0~100) ──
    const maxViews = Math.max(...days.map(d => d.views));
    const recentViews = days.slice(-2).reduce((a, b) => a + b.views, 0) / 2;
    const trendScore = Math.min(100, Math.floor((recentViews / maxViews) * 100 * (0.7 + rand() * 0.6)));

    // ── 연관 해시태그 ──
    const relatedHashtags = getRelatedHashtags(cleanKeyword, seededRandom(seed + 1));

    // ── 마케팅 인사이트 ──
    const insights = [
      competition === '하'
        ? `📈 경쟁 강도가 낮아 지금 진입하면 상위 노출에 유리합니다!`
        : competition === '중'
        ? `⚖️ 적당한 경쟁 강도. 고품질 콘텐츠로 차별화 전략이 필요합니다.`
        : `🔥 경쟁이 치열합니다. 니치 서브태그와 조합 전략을 추천합니다.`,
      trendScore >= 70
        ? `🚀 현재 상승 트렌드! 빠른 업로드가 바이럴 효과를 극대화합니다.`
        : trendScore >= 40
        ? `📊 안정적인 검색량을 보유한 스테디셀러 해시태그입니다.`
        : `💡 하락 추세. 연관 태그와 함께 사용해 노출을 보완하세요.`,
    ];

    return NextResponse.json({
      keyword: cleanKeyword,
      trendScore,
      totalPosts,
      competition,
      competitionEn,
      competitionColor,
      chartData: days,
      relatedHashtags,
      insights,
      generatedAt: today.toISOString(),
    });
  } catch (error: any) {
    console.error('[hashtag-trend]', error);
    return NextResponse.json({ error: '분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

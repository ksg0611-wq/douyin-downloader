import { NextResponse } from 'next/server';

const MAX_RETRIES = 3;

function toKoreanError(status: number): string {
  if (status === 429 || status === 503) {
    return '💡 현재 AI 요청량이 많아 잠시 제한되었습니다. 1분 뒤에 다시 시도해 주세요!';
  }
  return '⚠️ AI 번역 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
}

async function callGeminiWithRetry(url: string, body: string): Promise<Response> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if ((res.status === 503 || res.status === 429) && attempt < MAX_RETRIES - 1) {
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      continue;
    }
    return res;
  }
  const err = new Error('RATE_LIMIT_EXCEEDED');
  (err as any).status = 429;
  throw err;
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: { message: '⚠️ 서버 설정 오류입니다.' } }, { status: 500 });
    }
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: { message: '번역할 텍스트를 입력해 주세요.' } }, { status: 400 });
    }

    const cleanText = text.trim().slice(0, 300);

    const prompt = `너는 글로벌 숏폼(TikTok, Reels, YouTube Shorts) 전문 해외 바이럴 마케터야.
입력된 한국어 숏폼 제목을 단순히 직역하지 말고, 해외 유저들이 피드에서 봤을 때 클릭하고 싶게 만드는 '현지인 감성의 바이럴 타이틀'로 의역해 줘.

입력 원문: "${cleanText}"

아래 형식으로 정확히 출력해 줘. 각 언어별로 세 가지 버전과 한글 마케팅 팁을 반드시 포함할 것.

---

## 🇺🇸 영어 (EN)

| 버전 | 제목 | 마케팅 팁 |
|------|------|-----------|
| 1️⃣ 호기심 자극형 | [영어 제목] | [한글 팁] |
| 2️⃣ 정보 전달형 | [영어 제목] | [한글 팁] |
| 3️⃣ 밈/트렌디형 | [영어 제목] | [한글 팁] |

---

## 🇯🇵 일본어 (JA)

| 버전 | 제목 | 마케팅 팁 |
|------|------|-----------|
| 1️⃣ 호기심 자극형 | [일본어 제목] | [한글 팁] |
| 2️⃣ 정보 전달형 | [일본어 제목] | [한글 팁] |
| 3️⃣ 밈/트렌디형 | [일본어 제목] | [한글 팁] |

---

## 🇻🇳 베트남어 (VI)

| 버전 | 제목 | 마케팅 팁 |
|------|------|-----------|
| 1️⃣ 호기심 자극형 | [베트남어 제목] | [한글 팁] |
| 2️⃣ 정보 전달형 | [베트남어 제목] | [한글 팁] |
| 3️⃣ 밈/트렌디형 | [베트남어 제목] | [한글 팁] |

---

## 💡 종합 바이럴 전략 한 줄 요약

[이 콘텐츠를 글로벌 피드에서 바이럴시키기 위한 핵심 전략을 2~3문장으로 한글로 정리]`;

    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    });

    const response = await callGeminiWithRetry(targetUrl, body);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: { message: toKoreanError(response.status) } },
        { status: response.status }
      );
    }

    const output = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!output) {
      return NextResponse.json({ error: { message: '결과를 생성할 수 없습니다. 다시 시도해 주세요.' } }, { status: 500 });
    }

    // 언어별 섹션 파싱
    const enMatch = output.match(/## 🇺🇸 영어[\s\S]*?(?=## 🇯🇵|$)/);
    const jaMatch = output.match(/## 🇯🇵 일본어[\s\S]*?(?=## 🇻🇳|$)/);
    const viMatch = output.match(/## 🇻🇳 베트남어[\s\S]*?(?=## 💡|$)/);
    const summaryMatch = output.match(/## 💡 종합[\s\S]*?$/);

    return NextResponse.json({
      success: true,
      full: output,
      sections: {
        en: enMatch?.[0]?.trim() ?? '',
        ja: jaMatch?.[0]?.trim() ?? '',
        vi: viMatch?.[0]?.trim() ?? '',
        summary: summaryMatch?.[0]?.trim() ?? '',
      },
    });
  } catch (error: any) {
    const status = error?.status === 429 ? 429 : 500;
    const message = status === 429
      ? '💡 현재 AI 요청량이 많아 잠시 제한되었습니다. 1분 뒤에 다시 시도해 주세요!'
      : '⚠️ AI 서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.';
    return NextResponse.json({ error: { message } }, { status });
  }
}

export const runtime = 'edge';

import { NextResponse } from 'next/server';

const MAX_RETRIES = 3;

function toKoreanError(status: number, message?: string): string {
  if (status === 429 || status === 503) {
    return '💡 현재 AI 요청량이 많아 잠시 제한되었습니다. 1분 뒤에 다시 시도해 주세요!';
  }
  if (status === 500 || status === 400) {
    return '⚠️ AI 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
  }
  if (message?.includes('API_KEY_MISSING')) {
    return '⚠️ 서버 설정 오류입니다. 관리자에게 문의해 주세요.';
  }
  return '⚠️ 썸네일 텍스트 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
}

async function callGeminiWithRetry(targetUrl: string, body: string): Promise<Response> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if ((response.status === 503 || response.status === 429) && attempt < MAX_RETRIES - 1) {
      const waitMs = 1000 * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, waitMs));
      continue;
    }

    return response;
  }

  const limitError = new Error('RATE_LIMIT_EXCEEDED');
  (limitError as any).status = 429;
  throw limitError;
}

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { error: { message: '⚠️ 영상의 주제나 내용을 입력해 주세요.' } },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: { message: '⚠️ 서버 설정 오류입니다. 관리자에게 문의해 주세요.', code: 'API_KEY_MISSING' } },
        { status: 500 }
      );
    }

    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const prompt = `너는 숏폼 플랫폼(도우인, 틱톡, 쇼츠, 릴스)에서 클릭률을 폭발시키는 천재 카피라이터야. 사용자가 입력한 영상의 주제나 내용을 바탕으로, 썸네일(커버 이미지)에 적기 좋은 짧고 강렬하며 가독성이 뛰어난 텍스트 10개를 생성해 줘.
요청 조건:
- 5개는 '매운맛(자극적, 호기심 유발, 금지어/비결 활용)' 컨셉으로 작성해 줘.
- 나머지 5개는 '순한맛(정보성, 혜택 강조, 전문성)' 컨셉으로 작성해 줘.
- 결과는 썸네일에 들어가기 적합하도록 8자~15자 내외의 매우 짧고 임팩트 있는 형태여야 해.

결과는 반드시 아래의 키(key)를 갖는 JSON 형식으로만 반환해 줘. 마크다운 기호(예: \`\`\`json)나 앞뒤 설명 텍스트는 절대로 붙이지 말고, 중괄호로 시작해서 중괄호로 끝나는 순수 JSON 텍스트로만 대답해 줘.
"spicy" 및 "mild" 항목은 반드시 각각 문자열 5개가 담긴 배열이어야 해.

예시 형식:
{
  "spicy": [
    "매운맛 텍스트 1",
    "매운맛 텍스트 2",
    "매운맛 텍스트 3",
    "매운맛 텍스트 4",
    "매운맛 텍스트 5"
  ],
  "mild": [
    "순한맛 텍스트 1",
    "순한맛 텍스트 2",
    "순한맛 텍스트 3",
    "순한맛 텍스트 4",
    "순한맛 텍스트 5"
  ]
}

영상 주제 및 내용:
${topic}`;

    const body = JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    });

    const response = await callGeminiWithRetry(targetUrl, body);
    const data = await response.json();

    if (!response.ok) {
      const koreanMsg = toKoreanError(response.status, data.error?.message);
      return NextResponse.json({ error: { message: koreanMsg } }, { status: response.status });
    }

    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    let jsonStr = outputText.trim();
    if (jsonStr.startsWith("```")) {
      const match = jsonStr.match(/```(?:json)?([\s\S]*?)```/);
      if (match) {
        jsonStr = match[1].trim();
      }
    }

    try {
      const resultObj = JSON.parse(jsonStr);
      
      if (!Array.isArray(resultObj.spicy) || resultObj.spicy.length < 5 || !Array.isArray(resultObj.mild) || resultObj.mild.length < 5) {
        throw new Error("INCOMPLETE_JSON");
      }

      return NextResponse.json({ success: true, data: resultObj });
    } catch (parseErr) {
      console.warn("JSON parsing failed, falling back to backup extract", outputText);
      return NextResponse.json({
        success: true,
        data: {
          spicy: [
            `이것 모르면 평생 후회합니다! 🔥`,
            `아무도 말 안 해준 ${topic}의 실체`,
            `진짜 ${topic} 떡상하는 단 하나의 비결`,
            `이것만 바꿔도 10배 폭발합니다`,
            `설마 아직도 이렇게 하세요? ❌`
          ],
          mild: [
            `${topic} 초보자도 바로 따라 하는 가이드`,
            `가장 확실한 ${topic} 3단계 꿀팁`,
            `성공 확률 99% ${topic} 노하우`,
            `이것만 알면 ${topic} 끝장납니다`,
            `전문가가 알려주는 ${topic} 정석`
          ]
        }
      });
    }

  } catch (error: any) {
    const status = error?.status === 429 ? 429 : 500;
    const message = status === 429
      ? '💡 현재 AI 요청량이 많아 잠시 제한되었습니다. 1분 뒤에 다시 시도해 주세요!'
      : '⚠️ AI 서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.';
    return NextResponse.json({ error: { message } }, { status });
  }
}

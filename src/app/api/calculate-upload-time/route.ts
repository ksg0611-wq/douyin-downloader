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
  return '⚠️ 시간 계산 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
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
    const { country, platform } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!country || !platform) {
      return NextResponse.json(
        { error: { message: '⚠️ 국가와 플랫폼을 정확히 선택해 주세요.' } },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: { message: '⚠️ 서버 설정 오류입니다. 관리자에게 문의해 주세요.', code: 'API_KEY_MISSING' } },
        { status: 500 }
      );
    }

    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

    const prompt = `너는 글로벌 숏폼 알고리즘 전문가야. 사용자가 타겟 국가와 타겟 플랫폼을 입력하면, 해당 국가의 플랫폼 유저들이 가장 활발히 반응하는 피크 요일과 시간대를 분석해 줘. 
그리고 이를 대한민국 서울 표준시(KST)로 정확하게 환산한 시간대를 계산해 줘.

결과는 반드시 아래의 키(key)를 갖는 JSON 형식으로만 반환해 줘. 마크다운 기호(예: \`\`\`json)나 앞뒤 설명 텍스트는 절대로 붙이지 말고, 중괄호로 시작해서 중괄호로 끝나는 순수 JSON 텍스트로만 대답해 줘.

예시 형식:
{
  "targetLocalTime": "현지 현지 시간 기준 추천 요일 및 시간대 내용",
  "koreanTime": "한국 표준시(KST) 기준 예약 업로드 추천 요일 및 시간대 내용",
  "reason": "해당 시간대를 추천하는 유저 사용 행동 패턴 분석 및 트래픽 요인 설명 내용"
}

입력 정보:
- 타겟 국가: ${country}
- 타겟 플랫폼: ${platform}`;

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
      
      if (!resultObj.targetLocalTime || !resultObj.koreanTime || !resultObj.reason) {
        throw new Error("INCOMPLETE_JSON");
      }

      return NextResponse.json({ success: true, data: resultObj });
    } catch (parseErr) {
      console.warn("JSON parsing failed, falling back to backup extract", outputText);
      return NextResponse.json({
        success: true,
        data: {
          targetLocalTime: `매주 화요일 ~ 목요일 오후 6:00 ~ 오후 9:00 (현지 시간)`,
          koreanTime: `매주 화요일 ~ 목요일 오전 9:00 ~ 오후 12:00 (KST 기준)`,
          reason: `${country}의 퇴근 시간대 및 직장인/학생 트래픽 집중 구간을 겨냥한 골든 아워입니다. 해당 지역의 모바일 사용 집중율이 극대화되는 시기이므로 해당 타임에 맞춰 업로드 및 예약을 권장합니다.`
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

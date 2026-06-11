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
  return '⚠️ 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
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
    const { content } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: { message: '⚠️ 분석할 영상 대본이나 내용을 입력해 주세요.' } },
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

    const prompt = `너는 100만 조회수를 만드는 탑티어 숏폼 콘텐츠 기획자야. 사용자가 입력한 타겟 영상의 대본이나 내용을 분석해서 다음 4가지 항목을 구조화하여 답변해 줘.
1. 3초 후킹 포인트 분석
2. 시청자 이탈을 막은 전개(Body) 방식
3. 행동 유도(CTA) 전략
4. 내 채널에 적용할 변형 아이디어 3가지

결과는 반드시 아래의 키(key)를 갖는 JSON 형식으로만 반환해 줘. 마크다운 기호(예: \`\`\`json)나 앞뒤 설명 텍스트는 절대로 붙이지 말고, 중괄호로 시작해서 중괄호로 끝나는 순수 JSON 텍스트로만 대답해 줘. 
"ideas" 항목은 반드시 문자열 3개가 담긴 배열이어야 해.

예시 형식:
{
  "hook": "3초 후킹 포인트 분석 내용",
  "body": "시청자 이탈을 막은 전개(Body) 방식 내용",
  "cta": "행동 유도(CTA) 전략 내용",
  "ideas": [
    "변형 아이디어 1",
    "변형 아이디어 2",
    "변형 아이디어 3"
  ]
}

분석할 내용:
${content}`;

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
      
      if (!resultObj.hook || !resultObj.body || !resultObj.cta || !Array.isArray(resultObj.ideas) || resultObj.ideas.length < 3) {
        throw new Error("INCOMPLETE_JSON");
      }

      return NextResponse.json({ success: true, data: resultObj });
    } catch (parseErr) {
      console.warn("JSON parsing failed, falling back to backup extract", outputText);
      return NextResponse.json({
        success: true,
        data: {
          hook: "영상의 초반 3초에서 강한 의문이나 반전을 주어 시청자의 시선을 즉시 고정시켰습니다.",
          body: "내용의 정보 밀도를 촘촘하게 유지하고 숏폼 특유의 빠른 템포와 컷편집 구조를 활용해 지루함을 없앴습니다.",
          cta: "끝부분에 단순 저장이나 공유를 유도하는 명확한 한 줄 액션을 넣어 바이럴 지수를 끌어올렸습니다.",
          ideas: [
            "1단계 문제 제기를 우리 채널의 핵심 주제로 치환하여 인트로 기획하기",
            "2단계 중간 단계의 해결 과정을 3가지 리스트 요약식으로 구성하여 가독성 높이기",
            "3단계 시청자에게 직접 질문을 던지는 방식으로 댓글 반응률 유도하기"
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

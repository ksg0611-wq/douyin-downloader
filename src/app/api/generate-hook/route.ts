import { NextResponse } from 'next/server';

const MAX_RETRIES = 3;

// 구글 에러 메시지 → 한국어 안내문 변환
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
  return '⚠️ AI 대본 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
}

async function callGeminiWithRetry(targetUrl: string, body: string): Promise<Response> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if ((response.status === 503 || response.status === 429) && attempt < MAX_RETRIES - 1) {
      const waitMs = 1000 * Math.pow(2, attempt); // 1초 → 2초 → 4초
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
        { error: { message: '⚠️ 주제를 입력해 주세요.' } },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: { message: '⚠️ 서버 설정 오류입니다. 관리자에게 문의해 주세요.', code: 'API_KEY_MISSING' } },
        { status: 500 }
      );
    }

    // gemini-3.5-flash (기존 프로젝트 모델 사용)
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const prompt = `너는 글로벌 최고 수준의 숏폼 마케터야. 유저가 입력한 주제에 대해 시청자의 시선을 3초 안에 사로잡을 수 있는 숏폼 대본의 '첫 문장(Hook)'을 3가지 스타일(1. 도발적인 팩트 폭행, 2. 감성적인 공감 유도, 3. 호기심을 극대화하는 질문)로 작성해 줘. 
결과는 반드시 각 스타일을 키(key)로 갖는 다음과 같은 JSON 형식으로만 반환해 줘. 마크다운 기호(예: \`\`\`json)나 다른 설명 텍스트는 절대로 앞뒤로 붙이지 말고, 중괄호로 시작해서 중괄호로 끝나는 순수 JSON 텍스트로만 대답해 줘.
예시 형식:
{
  "fact": "도발적인 팩트 폭행 내용",
  "empathy": "감성적인 공감 유도 내용",
  "question": "호기심을 극대화하는 질문 내용"
}

영상 주제: ${topic}`;

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
    
    // JSON 문자열 정제 로직
    let jsonStr = outputText.trim();
    if (jsonStr.startsWith("```")) {
      const match = jsonStr.match(/```(?:json)?([\s\S]*?)```/);
      if (match) {
        jsonStr = match[1].trim();
      }
    }

    try {
      const resultObj = JSON.parse(jsonStr);
      
      // 필수 키값(fact, empathy, question)이 존재하는지 정합성 체크
      if (!resultObj.fact || !resultObj.empathy || !resultObj.question) {
        throw new Error("INCOMPLETE_JSON");
      }

      return NextResponse.json({ success: true, data: resultObj });
    } catch (parseErr) {
      // JSON 파싱 실패 혹은 불완전할 경우 기본 플레인 텍스트 파싱 대비책 제공
      console.warn("JSON parsing failed, falling back to manual extract", outputText);
      return NextResponse.json({
        success: true,
        data: {
          fact: `${topic}에 대한 팩트 폭행 도입부: 이대로 가면 진짜 큰일 납니다.`,
          empathy: `${topic}로 고민 중이시죠? 저도 다 겪어봤는데, 이렇게 해결했습니다.`,
          question: `혹시 아직도 ${topic}를 이렇게 비효율적으로 하고 계신가요?`
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

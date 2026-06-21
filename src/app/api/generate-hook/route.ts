import { NextResponse } from 'next/server';
import { getClientIp, isRateLimited } from '@/lib/rateLimit';

const MAX_RETRIES = 3;

// ─── Fallback 샘플 데이터 (API 한도 초과 시 대체 데이터) ───────────────────────────
function getFallbackData(topic: string) {
  console.warn('[generate-hook] ⚠️ FALLBACK MODE 활성화 - Google API 한도 초과로 샘플 데이터를 반환합니다.');
  return {
    fact: `[샘플] ${topic}에 대한 충격적인 진실: 전문가 95%가 이미 알고 있는데 당신만 모르고 있습니다.`,
    empathy: `[샘플] ${topic} 때문에 밤새 고민해 보신 적 있으신가요? 저도 그랬고, 결국 이렇게 해결했습니다.`,
    question: `[샘플] 혹시 아직도 ${topic}를 남들처럼 비효율적으로 하고 계신가요?`,
  };
}

// ─── 구글 에러 메시지 → 한국어 안내문 변환 ────────────────────────────────────────
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

// ─── Gemini API 재시도 로직 ────────────────────────────────────────────────────────
async function callGeminiWithRetry(targetUrl: string, body: string): Promise<Response> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    // 429/503이고 재시도 가능한 경우 exponential backoff 후 재시도
    if ((response.status === 503 || response.status === 429) && attempt < MAX_RETRIES - 1) {
      const waitMs = 1000 * Math.pow(2, attempt); // 1초 → 2초 → 4초
      console.warn(`[generate-hook] API 재시도 ${attempt + 1}/${MAX_RETRIES - 1} (${waitMs}ms 대기)`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
      continue;
    }

    return response;
  }

  // 모든 재시도 소진 → 429 에러 throw (Fallback 활성화 신호)
  const limitError = new Error('RATE_LIMIT_EXCEEDED');
  (limitError as any).status = 429;
  throw limitError;
}

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();
    
    // IP 기반 Rate Limiter 검증 (1분에 5회 초과 시 429 Too Many Requests 반환 및 Fallback 연동)
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      console.warn(`[generate-hook] 🚨 Rate limit exceeded for IP: ${ip} (Local Limiter). Returning fallback.`);
      return NextResponse.json({
        success: true,
        data: getFallbackData(topic ? topic.trim() : ''),
        fallback: true,
        fallbackReason: 'LOCAL_RATE_LIMIT',
      }, { status: 429 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { error: { message: '⚠️ 주제를 입력해 주세요.' } },
        { status: 400 }
      );
    }

    if (!apiKey) {
      console.error('[generate-hook] GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
      return NextResponse.json(
        { error: { message: '⚠️ 서버 설정 오류입니다. 관리자에게 문의해 주세요.', code: 'API_KEY_MISSING' } },
        { status: 500 }
      );
    }

    // gemini-2.0-flash-lite 모델 사용
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

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

    let response: Response;
    let isFallback = false;

    try {
      response = await callGeminiWithRetry(targetUrl, body);
    } catch (retryErr: any) {
      // ── Fallback 모드: 429 한도 초과 시 샘플 데이터 반환 (200 OK) ──
      if (retryErr?.status === 429) {
        console.warn('[generate-hook] 모든 재시도 소진 → Fallback 샘플 데이터 반환');
        return NextResponse.json({
          success: true,
          data: getFallbackData(topic.trim()),
          fallback: true,
          fallbackReason: 'RATE_LIMIT',
        });
      }
      throw retryErr; // 429 외 다른 에러는 그대로 throw
    }

    const data = await response.json();

    if (!response.ok) {
      const status = response.status;

      // ── 429/503 → Fallback 모드 (에러 대신 샘플 데이터) ──
      if (status === 429 || status === 503) {
        console.warn(`[generate-hook] HTTP ${status} 수신 → Fallback 샘플 데이터 반환`);
        return NextResponse.json({
          success: true,
          data: getFallbackData(topic.trim()),
          fallback: true,
          fallbackReason: status === 429 ? 'RATE_LIMIT' : 'SERVICE_UNAVAILABLE',
        });
      }

      // 그 외 오류는 한국어 에러 메시지로 반환
      const koreanMsg = toKoreanError(status, data.error?.message);
      console.error(`[generate-hook] Gemini API 오류 (${status}):`, data.error?.message);
      return NextResponse.json({ error: { message: koreanMsg } }, { status });
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
        throw new Error('INCOMPLETE_JSON');
      }

      return NextResponse.json({ success: true, data: resultObj });
    } catch (parseErr) {
      // JSON 파싱 실패 혹은 불완전할 경우 주제 기반 기본 텍스트로 응답
      console.warn('[generate-hook] JSON 파싱 실패, 텍스트 기반 Fallback으로 대체', outputText);
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
    // 최상위 catch: 네트워크 오류 등 예상치 못한 에러
    const status = error?.status === 429 ? 429 : 500;
    const message = status === 429
      ? '💡 현재 AI 요청량이 많아 잠시 제한되었습니다. 1분 뒤에 다시 시도해 주세요!'
      : '⚠️ AI 서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.';
    console.error('[generate-hook] 예상치 못한 에러:', error);
    return NextResponse.json({ error: { message } }, { status });
  }
}

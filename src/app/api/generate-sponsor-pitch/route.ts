export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getClientIp, isRateLimited } from '@/lib/rateLimit';

const MAX_RETRIES = 3;

// ─── 한국어 에러 메시지 변환 ─────────────────────────────────────────────────────
function toKoreanError(status: number, message?: string): string {
  if (status === 429 || status === 503) {
    return '현재 AI 서버 사용량이 많아 요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.';
  }
  if (status === 500 || status === 400) {
    return '⚠️ AI 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
  }
  if (message?.includes('API_KEY_MISSING')) {
    return '⚠️ 서버 설정 오류입니다. 관리자에게 문의해 주세요.';
  }
  return '⚠️ AI 제안서 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
}

// ─── Gemini API 재시도 로직 ──────────────────────────────────────────────────────
async function callGeminiWithRetry(targetUrl: string, body: string): Promise<Response> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if ((response.status === 503 || response.status === 429) && attempt < MAX_RETRIES - 1) {
      const waitMs = 1000 * Math.pow(2, attempt);
      console.warn(`[generate-sponsor-pitch] API 재시도 ${attempt + 1}/${MAX_RETRIES - 1} (${waitMs}ms 대기)`);
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
  let bodyData: any;
  try {
    bodyData = await request.json();
  } catch {
    return NextResponse.json(
      { error: "유효한 요청 파라미터가 아닙니다." },
      { status: 400 }
    );
  }

  try {
    const { channelTopic, targetAudience, targetBrand } = bodyData || {};

    // IP 기반 Rate Limiter 검증 (1분에 5회 초과 시 429 Too Many Requests 반환)
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      console.warn(`[generate-sponsor-pitch] 🚨 Rate limit exceeded for IP: ${ip} (Local Limiter)`);
      return NextResponse.json(
        { error: "요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요." },
        { status: 429 }
      );
    }

    // WO-03: 파라미터 유효성 검사 강화 (500 서버 크래시 방지 및 400 규격화)
    if (!channelTopic || typeof channelTopic !== 'string' || !channelTopic.trim() ||
        !targetAudience || typeof targetAudience !== 'string' || !targetAudience.trim() ||
        !targetBrand || typeof targetBrand !== 'string' || !targetBrand.trim()) {
      return NextResponse.json(
        { error: "유효한 요청 파라미터가 아닙니다." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[generate-sponsor-pitch] GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
      return NextResponse.json(
        { error: "서버 설정 오류입니다. 관리자에게 문의해 주세요.", code: 'API_KEY_MISSING' },
        { status: 500 }
      );
    }

    // 2026 최신 Gemini 모델 gemini-2.5-flash-lite 적용
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    const prompt = `너는 탑티어 MCN 소속의 전문 비즈니스 매니저야. 사용자가 제공하는 채널 정보와 타겟 브랜드를 바탕으로, 해당 브랜드의 담당 마케터가 첫눈에 관심을 갖고 긍정적인 답변을 보낼 수 있는 수준 높은 [협찬 제안 콜드 메일(또는 DM)] 초안을 작성해 줘.
결과는 반드시 아래의 지정된 JSON 키 형식으로만 구성해서 반환해 줘. 마크다운 기호(예: \`\`\`json)나 다른 설명 텍스트는 절대로 앞뒤로 붙이지 말고, 중괄호로 시작해서 중괄호로 끝나는 순수 JSON 텍스트로만 대답해 줘.

예시 형식:
{
  "subject": "이메일 제목",
  "greeting": "인사말",
  "channelAppeal": "채널 어필 포인트",
  "synergy": "브랜드와 채널의 시너지",
  "concept": "구체적인 숏폼 영상 기획안",
  "closing": "마무리 멘트"
}

입력 정보:
- 채널 주제: ${channelTopic.trim()}
- 주요 시청자층: ${targetAudience.trim()}
- 협찬받고 싶은 타겟 브랜드: ${targetBrand.trim()}`;

    const body = JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    });

    let response: Response;

    try {
      response = await callGeminiWithRetry(targetUrl, body);
    } catch (retryErr: any) {
      if (retryErr?.status === 429 || retryErr?.message === 'RATE_LIMIT_EXCEEDED') {
        console.warn('[generate-sponsor-pitch] 모든 재시도 소진 (429 Rate Limit)');
        return NextResponse.json(
          { error: "현재 AI 서버 사용량이 많아 요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요." },
          { status: 429 }
        );
      }
      throw retryErr;
    }

    const data = await response.json();

    // WO-02: 상위 AI API 호출 실패 시 명확한 상세 로깅 추가
    if (!response.ok) {
      const status = response.status;
      const errorDetails = JSON.stringify(data);
      console.error(`[generate-sponsor-pitch] ❌ 상위 AI API(Gemini) 호출 실패! Status: ${status} (${response.statusText}), Error Response: ${errorDetails}`);

      if (status === 429 || status === 503) {
        return NextResponse.json(
          { error: "현재 AI 서버 사용량이 많아 요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요." },
          { status }
        );
      }

      const koreanMsg = toKoreanError(status, data.error?.message);
      return NextResponse.json({ error: koreanMsg, details: data.error?.message }, { status });
    }

    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    let jsonStr = outputText.trim();
    if (jsonStr.startsWith("```")) {
      const match = jsonStr.match(/```(?:json)?([\s\S]*?)```/);
      if (match) {
        jsonStr = match[match.length - 1].trim();
      }
    }

    try {
      const resultObj = JSON.parse(jsonStr);
      
      const requiredKeys = ["subject", "greeting", "channelAppeal", "synergy", "concept", "closing"];
      const hasAllKeys = requiredKeys.every(k => k in resultObj);

      if (!hasAllKeys) {
        throw new Error("INCOMPLETE_JSON");
      }

      return NextResponse.json({ success: true, data: resultObj });
    } catch (parseErr) {
      console.error("[generate-sponsor-pitch] JSON 파싱 실패:", parseErr, outputText);
      return NextResponse.json(
        { error: "AI 응답을 파싱하는 데 실패했습니다. 잠시 후 다시 시도해 주세요." },
        { status: 500 }
      );
    }

  } catch (error: any) {
    const status = (error?.status === 429 || error?.status === 503) ? error.status : 500;
    const message = (status === 429 || status === 503)
      ? '현재 AI 서버 사용량이 많아 요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.'
      : '⚠️ AI 서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.';
    // WO-02: 상위 AI API 예외 발생 시 상세 로깅 추가
    console.error('[generate-sponsor-pitch] ❌ 상위 AI API 호출 또는 처리 중 예외 발생:', {
      message: error?.message,
      stack: error?.stack,
      status: error?.status,
    });
    return NextResponse.json({ error: message, details: error?.message }, { status });
  }
}

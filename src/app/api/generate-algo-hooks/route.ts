export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getClientIp, isRateLimited } from '@/lib/rateLimit';

const MAX_RETRIES = 3;

// ─── Fallback 샘플 데이터 ──────────────────────────────────────────────────────
function getFallbackData(topic: string) {
  console.warn('[generate-algo-hooks] ⚠️ FALLBACK MODE 활성화 - Google API 한도 초과로 샘플 데이터를 반환합니다.');
  return {
    cta: [
      `[샘플] 솔직히 이거 모르면 앞으로 평생 손해입니다. 지금 당장 저장하고 꺼내보세요!`,
      `[샘플] 이 정보, 친구에게 공유 안 하면 다음 달 후회할 겁니다.`,
      `[샘플] 더 디테일한 비법은 캡션에 다 풀어뒀으니, 좋아요 누르고 확인해 보세요!`,
      `[샘플] 어차피 나중에 다시 보게 될 테니 미리 북마크에 저장해 두세요.`,
      `[샘플] 이 방법으로 인생이 바뀔 준비가 되셨다면, 좋아요 버튼 클릭!`
    ],
    comment: [
      `[샘플] ${topic}에 대해 여러분은 어떻게 생각하시나요?`,
      `[샘플] 이 영상이 도움 되셨다면, 댓글에 '확인'이라고 남겨주세요!`,
      `[샘플] 솔직히 1번 방법이 더 유용한가요, 아니면 2번인가요? 댓글로 골라주세요.`,
      `[샘플] 나만의 ${topic} 꿀팁이 있다면 댓글로 자유롭게 공유해 주세요!`,
      `[샘플] 이 방법 외에 궁금한 점이 있다면 댓글로 남겨주시면 답해 드립니다.`
    ]
  };
}

// ─── 한국어 에러 메시지 변환 ─────────────────────────────────────────────────────
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
  return '⚠️ 문구 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
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
      console.warn(`[generate-algo-hooks] API 재시도 ${attempt + 1}/${MAX_RETRIES - 1} (${waitMs}ms 대기)`);
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

    // IP 기반 Rate Limiter 검증 (1분에 5회 초과 시 429 Too Many Requests 반환 및 Fallback 연동)
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      console.warn(`[generate-algo-hooks] 🚨 Rate limit exceeded for IP: ${ip} (Local Limiter). Returning fallback.`);
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
        { error: { message: '⚠️ 영상의 주제나 내용을 입력해 주세요.' } },
        { status: 400 }
      );
    }

    if (!apiKey) {
      console.error('[generate-algo-hooks] GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
      return NextResponse.json(
        { error: { message: '⚠️ 서버 설정 오류입니다. 관리자에게 문의해 주세요.', code: 'API_KEY_MISSING' } },
        { status: 500 }
      );
    }

    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

    const prompt = `너는 숏폼 알고리즘을 지배하는 그로스 해커(Growth Hacker)이자 카피라이터야. 사용자가 영상의 주제나 핵심 내용을 입력하면, 시청자의 행동(저장, 공유, 좋아요, 댓글)을 폭발적으로 유도하는 '마지막 멘트(CTA)'와 '고정 댓글용 질문' 10개를 생성해 줘.
요청 조건:
- 5개는 '행동 유도 CTA(예: 이거 모르면 손해, 당장 저장!)' 컨셉으로 작성해 줘.
- 나머지 5개는 '댓글 유도 질문(예: 여러분의 선택은 A? B?)' 컨셉으로 작성해 줘.
- 텍스트는 숏폼 플랫폼 특성에 맞게 트렌디하고 흥미로워야 해.

결과는 반드시 아래의 키(key)를 갖는 JSON 형식으로만 반환해 줘. 마크다운 기호(예: \`\`\`json)나 앞뒤 설명 텍스트는 절대로 붙이지 말고, 중괄호로 시작해서 중괄호로 끝나는 순수 JSON 텍스트로만 대답해 줘.
"cta" 및 "comment" 항목은 반드시 각각 문자열 5개가 담긴 배열이어야 해.

예시 형식:
{
  "cta": [
    "행동 유도 CTA 1",
    "행동 유도 CTA 2",
    "행동 유도 CTA 3",
    "행동 유도 CTA 4",
    "행동 유도 CTA 5"
  ],
  "comment": [
    "댓글 유도 질문 1",
    "댓글 유도 질문 2",
    "댓글 유도 질문 3",
    "댓글 유도 질문 4",
    "댓글 유도 질문 5"
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

    let response: Response;

    try {
      response = await callGeminiWithRetry(targetUrl, body);
    } catch (retryErr: any) {
      // 모든 재시도 소진 → Fallback 샘플 데이터 반환
      if (retryErr?.status === 429) {
        console.warn('[generate-algo-hooks] 모든 재시도 소진 → Fallback 샘플 데이터 반환');
        return NextResponse.json({
          success: true,
          data: getFallbackData(topic.trim()),
          fallback: true,
          fallbackReason: 'RATE_LIMIT',
        });
      }
      throw retryErr;
    }

    const data = await response.json();

    if (!response.ok) {
      const status = response.status;

      // 429/503 → Fallback 모드
      if (status === 429 || status === 503) {
        console.warn(`[generate-algo-hooks] HTTP ${status} 수신 → Fallback 샘플 데이터 반환`);
        return NextResponse.json({
          success: true,
          data: getFallbackData(topic.trim()),
          fallback: true,
          fallbackReason: status === 429 ? 'RATE_LIMIT' : 'SERVICE_UNAVAILABLE',
        });
      }

      const koreanMsg = toKoreanError(status, data.error?.message);
      console.error(`[generate-algo-hooks] Gemini API 오류 (${status}):`, data.error?.message);
      return NextResponse.json({ error: { message: koreanMsg } }, { status });
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
      
      if (!Array.isArray(resultObj.cta) || resultObj.cta.length < 5 || !Array.isArray(resultObj.comment) || resultObj.comment.length < 5) {
        throw new Error("INCOMPLETE_JSON");
      }

      return NextResponse.json({ success: true, data: resultObj });
    } catch (parseErr) {
      console.warn("[generate-algo-hooks] JSON 파싱 실패, 텍스트 기반 Fallback으로 대체", outputText);
      return NextResponse.json({
        success: true,
        data: {
          cta: [
            `솔직히 이거 모르면 앞으로 평생 손해입니다. 지금 당장 저장하고 꺼내보세요!`,
            `이 정보, 친구에게 공유 안 하면 다음 달 카드값 후회할 겁니다.`,
            `더 디테일한 비법은 캡션에 다 풀어뒀으니, 지금 좋아요 누르고 확인해 보세요!`,
            `어차피 나중에 다시 보게 될 테니 미리 북마크에 저장해 두세요.`,
            `이 방법으로 인생이 바뀔 준비가 되셨다면, 좋아요 버튼 클릭!`
          ],
          comment: [
            `설마 아직도 적금만 들고 계신가요? 여러분의 생각은 어떠신가요?`,
            `이 글이 도움 되셨다면, 댓글에 '확인'이라고 남겨주세요! (선착순 선물)`,
            `솔직히 1번 방법이 더 유용한가요, 아니면 2번인가요? 댓글로 골라주세요.`,
            `혹시 나만의 ${topic} 꿀팁이 있다면 댓글로 자유롭게 공유해 주세요!`,
            `이 방법 외에 추가로 궁금한 점이 있다면 댓글로 남겨주시면 답해 드립니다.`
          ]
        }
      });
    }

  } catch (error: any) {
    const status = error?.status === 429 ? 429 : 500;
    const message = status === 429
      ? '💡 현재 AI 요청량이 많아 잠시 제한되었습니다. 1분 뒤에 다시 시도해 주세요!'
      : '⚠️ AI 서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.';
    console.error('[generate-algo-hooks] 예상치 못한 에러:', error);
    return NextResponse.json({ error: { message } }, { status });
  }
}

import { NextResponse } from 'next/server';

const MAX_RETRIES = 3;

// ─── Fallback 샘플 데이터 ──────────────────────────────────────────────────────
function getFallbackCaption(title: string) {
  console.warn('[generate-caption] ⚠️ FALLBACK MODE 활성화 - Google API 한도 초과로 샘플 데이터를 반환합니다.');
  return `[샘플] ✨ ${title} — 이건 진짜 해봐야 압니다. 놓치면 후회해요! 📲 지금 바로 저장해두고 따라해 보세요.\n\n#숏폼 #틱톡 #인스타릴스 #바이럴 #꿀팁 #추천 #트렌드`;
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
  return '⚠️ AI 캡션 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
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
      console.warn(`[generate-caption] API 재시도 ${attempt + 1}/${MAX_RETRIES - 1} (${waitMs}ms 대기)`);
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
    const { title } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('[generate-caption] GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
      return NextResponse.json(
        { error: { message: '⚠️ 서버 설정 오류입니다. 관리자에게 문의해 주세요.', code: 'API_KEY_MISSING' } },
        { status: 500 }
      );
    }

    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

    const body = JSON.stringify({
      contents: [{
        parts: [{
          text: `너는 10년 차 숏폼 바이럴 마케터야. 다음 주어진 영상 제목을 바탕으로 틱톡, 인스타그램 릴스에 올리기 좋은 시선을 끄는 한국어 캡션(3문장 내외)과 검색 노출에 최적화된 해시태그 5~7개를 추천해 줘. 이모지를 적절히 섞어줘. 영상 제목: ${title}`
        }]
      }]
    });

    let response: Response;

    try {
      response = await callGeminiWithRetry(targetUrl, body);
    } catch (retryErr: any) {
      // 모든 재시도 소진 → Fallback 샘플 캡션 반환
      if (retryErr?.status === 429) {
        console.warn('[generate-caption] 모든 재시도 소진 → Fallback 샘플 데이터 반환');
        const fallbackText = getFallbackCaption(title || '영상');
        return NextResponse.json({
          success: true,
          text: fallbackText,
          caption: fallbackText,
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
        console.warn(`[generate-caption] HTTP ${status} 수신 → Fallback 샘플 데이터 반환`);
        const fallbackText = getFallbackCaption(title || '영상');
        return NextResponse.json({
          success: true,
          text: fallbackText,
          caption: fallbackText,
          fallback: true,
          fallbackReason: status === 429 ? 'RATE_LIMIT' : 'SERVICE_UNAVAILABLE',
        });
      }

      const koreanMsg = toKoreanError(status, data.error?.message);
      console.error(`[generate-caption] Gemini API 오류 (${status}):`, data.error?.message);
      return NextResponse.json({ error: { message: koreanMsg } }, { status });
    }

    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || '콘텐츠를 생성할 수 없습니다.';
    return NextResponse.json({ success: true, text: outputText, caption: outputText });

  } catch (error: any) {
    const status = error?.status === 429 ? 429 : 500;
    const message = status === 429
      ? '💡 현재 AI 요청량이 많아 잠시 제한되었습니다. 1분 뒤에 다시 시도해 주세요!'
      : '⚠️ AI 서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.';
    console.error('[generate-caption] 예상치 못한 에러:', error);
    return NextResponse.json({ error: { message } }, { status });
  }
}

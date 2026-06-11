import { NextResponse } from 'next/server';

const MAX_RETRIES = 3;

// 구글 에러 메시지 → 한국어 안내문 변환
function toKoreanError(status: number, context: 'script' | 'caption' = 'script'): string {
  if (status === 429 || status === 503) {
    return '💡 현재 AI 요청량이 많아 잠시 제한되었습니다. 1분 뒤에 다시 시도해 주세요!';
  }
  if (status === 400) {
    return '⚠️ 오디오 형식이 지원되지 않습니다. 다른 영상으로 시도해 주세요.';
  }
  return context === 'script'
    ? '⚠️ AI 대본 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
    : '⚠️ AI 서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
}

async function callGeminiWithRetry(targetUrl: string, body: string): Promise<Response> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    // 429/503 → 지수 백오프 후 재시도
    if ((response.status === 503 || response.status === 429) && attempt < MAX_RETRIES - 1) {
      const waitMs = 1000 * Math.pow(2, attempt); // 1초 → 2초 → 4초
      await new Promise(resolve => setTimeout(resolve, waitMs));
      continue;
    }

    return response;
  }

  // 3회 재시도 후에도 실패 → 429로 처리
  const limitError = new Error('RATE_LIMIT_EXCEEDED');
  (limitError as any).status = 429;
  throw limitError;
}

export async function POST(request: Request) {
  try {
    const { audioUrl, videoTitle } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: { message: '⚠️ 서버 설정 오류입니다. 관리자에게 문의해 주세요.' } },
        { status: 500 }
      );
    }

    if (!audioUrl) {
      return NextResponse.json(
        { error: { message: '⚠️ 오디오 주소가 전달되지 않았습니다.' } },
        { status: 400 }
      );
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

    // ── 1단계: 오디오 파일 fetch (실패 시 텍스트 폴백) ──
    let audioBase64: string | null = null;
    let mimeType = 'audio/mpeg';

    try {
      const audioResponse = await fetch(audioUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.douyin.com/',
        },
        signal: AbortSignal.timeout(30000),
      });

      if (!audioResponse.ok) {
        throw new Error(`Audio fetch failed: ${audioResponse.status}`);
      }

      const contentType = audioResponse.headers.get('content-type') || 'audio/mpeg';
      if (contentType.includes('mp4') || contentType.includes('m4a')) {
        mimeType = 'audio/mp4';
      } else if (contentType.includes('webm')) {
        mimeType = 'audio/webm';
      } else if (contentType.includes('ogg')) {
        mimeType = 'audio/ogg';
      } else {
        mimeType = 'audio/mpeg';
      }

      const audioArrayBuffer = await audioResponse.arrayBuffer();
      audioBase64 = Buffer.from(audioArrayBuffer).toString('base64');
    } catch (fetchError: any) {
      // 오디오 fetch 실패 → 텍스트 전용 모드로 자동 폴백 (유저에겐 투명하게)
      console.warn('[extract-script] Audio fetch failed, using text-only fallback:', fetchError.message);
    }

    // ── 2단계: 프롬프트 구성 (멀티모달 또는 텍스트 전용) ──
    const systemPrompt = audioBase64
      ? `너는 최고의 멀티모달 AI이자 전문 번역가야. 주어진 오디오 음성을 듣고 다음 3가지를 정확히 한글 마크다운 형식으로 출력해 줘.

1) [타임라인별 중국어 원문 및 한국어 번역 대본]
- 형식: "⏱️ 00:00~00:05 | 中: [원문] → KO: [번역]" 형태로 타임라인별로 정리
- 오디오가 한국어라면 타임라인별 내용 요약으로 대체

2) [이 영상의 핵심 내용을 관통하는 3줄 요약]
- 핵심 메시지 3가지를 이모지와 함께 간결하게 정리

3) [한국 크리에이터가 이 콘텐츠를 벤치마킹할 때 쓰기 좋은 마케팅 인사이트 마크다운 표]
- 컬럼: 전략 포인트 | 원문 표현 | 한국화 적용 방안 | 기대 효과
- 최소 3행 이상 작성

영상 제목 참고: ${videoTitle || '제공 없음'}`
      : `너는 최고의 AI 마케팅 분석가야. 오디오를 직접 분석할 수 없는 상황이므로, 아래 영상 제목만으로 다음 3가지를 한글 마크다운 형식으로 작성해 줘.

영상 제목: ${videoTitle || '제목 없음'}

1) [예상 타임라인별 핵심 내용 요약]
- 제목을 기반으로 예상되는 영상 흐름을 3~5개 구간으로 추정 요약

2) [이 영상의 핵심 내용을 관통하는 3줄 요약]
- 핵심 메시지 3가지를 이모지와 함께 간결하게 정리

3) [한국 크리에이터가 이 콘텐츠를 벤치마킹할 때 쓰기 좋은 마케팅 인사이트 마크다운 표]
- 컬럼: 전략 포인트 | 예상 원문 접근법 | 한국화 적용 방안 | 기대 효과

> ⚠️ 오디오를 직접 분석하지 못해 영상 제목 기반 추정 결과입니다.`;

    const requestBody = audioBase64
      ? JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType, data: audioBase64 } },
              { text: systemPrompt },
            ],
          }],
        })
      : JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
        });

    // ── 3단계: Gemini API 호출 ──
    const response = await callGeminiWithRetry(geminiUrl, requestBody);
    const data = await response.json();

    if (!response.ok) {
      const koreanMsg = toKoreanError(response.status, 'script');
      return NextResponse.json({ error: { message: koreanMsg } }, { status: response.status });
    }

    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text
      || '대본을 생성할 수 없습니다. 다시 시도해 주세요.';

    return NextResponse.json({
      success: true,
      script: outputText,
      mode: audioBase64 ? 'multimodal' : 'text-fallback',
    });

  } catch (error: any) {
    console.error('[extract-script] Unhandled error:', error.message);
    // Max retries exceeded (429) or network error
    const status = error?.status === 429 ? 429 : 500;
    const message = status === 429
      ? '💡 현재 AI 요청량이 많아 잠시 제한되었습니다. 1분 뒤에 다시 시도해 주세요!'
      : '⚠️ AI 서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.';
    return NextResponse.json({ error: { message } }, { status });
  }
}

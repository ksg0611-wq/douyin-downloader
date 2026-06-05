import { NextResponse } from 'next/server';

const MAX_RETRIES = 3;

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

  throw new Error('Max retries exceeded');
}

export async function POST(request: Request) {
  try {
    const { audioUrl, videoTitle } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: { message: 'API_KEY_MISSING' } }, { status: 500 });
    }

    if (!audioUrl) {
      return NextResponse.json({ error: { message: 'audioUrl is required' } }, { status: 400 });
    }

    // 오디오 파일을 서버 측에서 fetch하여 base64 인코딩 (inlineData 방식)
    let audioBase64: string;
    let mimeType = 'audio/mpeg';

    try {
      const audioResponse = await fetch(audioUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.douyin.com/',
        },
        signal: AbortSignal.timeout(30000), // 30초 타임아웃
      });

      if (!audioResponse.ok) {
        throw new Error(`Audio fetch failed: ${audioResponse.status}`);
      }

      const contentType = audioResponse.headers.get('content-type') || 'audio/mpeg';
      // 지원 MIME 타입 정규화
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
      // 오디오 fetch 실패 시 텍스트 전용 모드로 폴백
      console.warn('Audio fetch failed, falling back to text-only mode:', fetchError.message);

      const systemPrompt = `너는 최고의 멀티모달 AI이자 전문 번역가야. 
오디오 파일을 가져올 수 없는 상황이므로, 주어진 영상 제목만을 바탕으로 다음 3가지를 한글 마크다운 형식으로 출력해 줘.

영상 제목: ${videoTitle || '제목 없음'}

1) [예상 타임라인별 핵심 내용 요약 (오디오 분석 불가로 추정치 제공)]
2) [이 영상의 핵심 내용을 관통하는 3줄 요약]
3) [한국 크리에이터가 이 콘텐츠를 벤치마킹할 때 쓰기 좋은 마케팅 인사이트 마크다운 표]

> ⚠️ 참고: 오디오 데이터를 직접 분석하지 못하여 영상 제목 기반 추정 결과입니다.`;

      const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
      const fallbackBody = JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
      });

      const response = await callGeminiWithRetry(targetUrl, fallbackBody);
      const data = await response.json();

      if (!response.ok) {
        const status = response.status;
        if (status === 503 || status === 429) {
          return NextResponse.json({ error: { message: 'AI 서버가 일시적으로 바쁩니다. 잠시 후 다시 시도해 주세요.' } }, { status: 503 });
        }
        return NextResponse.json({ error: { message: data.error?.message || 'Google API Error' } }, { status });
      }

      const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || '분석 결과를 생성할 수 없습니다.';
      return NextResponse.json({ success: true, script: outputText, mode: 'text-fallback' });
    }

    // 멀티모달 요청: 오디오 inlineData + 텍스트 프롬프트
    const systemPrompt = `너는 최고의 멀티모달 AI이자 전문 번역가야. 주어진 오디오 음성을 듣고 다음 3가지를 정확히 한글 마크다운 형식으로 출력해 줘.

1) [타임라인별 중국어 원문 및 한국어 번역 대본]
- 형식: "⏱️ 00:00~00:05 | 中: [원문] → KO: [번역]" 형태로 타임라인별로 정리
- 오디오가 한국어라면 타임라인별 내용 요약으로 대체

2) [이 영상의 핵심 내용을 관통하는 3줄 요약]
- 핵심 메시지 3가지를 이모지와 함께 간결하게 정리

3) [한국 크리에이터가 이 콘텐츠를 벤치마킹할 때 쓰기 좋은 마케팅 인사이트 마크다운 표]
- 컬럼: 전략 포인트 | 원문 표현 | 한국화 적용 방안 | 기대 효과
- 최소 3행 이상 작성

영상 제목 참고: ${videoTitle || '제공 없음'}`;

    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
    const requestBody = JSON.stringify({
      contents: [{
        parts: [
          {
            inlineData: {
              mimeType,
              data: audioBase64,
            },
          },
          {
            text: systemPrompt,
          },
        ],
      }],
    });

    const response = await callGeminiWithRetry(targetUrl, requestBody);
    const data = await response.json();

    if (!response.ok) {
      const status = response.status;
      if (status === 503 || status === 429) {
        return NextResponse.json({ error: { message: 'AI 서버가 일시적으로 바쁩니다. 잠시 후 다시 시도해 주세요.' } }, { status: 503 });
      }
      return NextResponse.json({ error: { message: data.error?.message || 'Google API Error' } }, { status });
    }

    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || '대본을 생성할 수 없습니다.';
    return NextResponse.json({ success: true, script: outputText, mode: 'multimodal' });

  } catch (error: any) {
    console.error('extract-script error:', error);
    return NextResponse.json({ error: { message: error.message || 'Internal Server Error' } }, { status: 500 });
  }
}

export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getClientIp, isRateLimited } from '@/lib/rateLimit';

const MAX_RETRIES = 3;

// ─── Fallback 샘플 데이터 (API 한도 초과 or 에러 시 반환) ───────────────────────────
function getFallbackData(trendKeyword: string) {
  const keyword = trendKeyword ? trendKeyword.trim() : '인기 급상승 트렌드';
  console.warn('[trend-planner] ⚠️ FALLBACK MODE 활성화 - 샘플 데이터를 반환합니다.');
  return {
    trendSummary: `[샘플] 현재 '${keyword}'은(는) 예상치 못한 화제성과 대중의 뜨거운 관심으로 인해 소셜 미디어 및 실시간 커뮤니티에서 빠르게 확산되고 있습니다.`,
    conceptA: {
      title: `이거 진짜 실화? 1분 만에 알아보는 ${keyword} 이슈`,
      hook: `지금 인터넷 터진 ${keyword} 이야기, 혹시 아직도 모르시나요? 🚨`,
      body: `최근 ${keyword}에 대한 다양한 분석과 소식이 쏟아지고 있습니다. 핵심은 세 가지입니다. 첫째, 왜 화제가 되었는지. 둘째, 대중의 구체적인 반응. 셋째, 앞으로의 전망입니다. 이 요약만 알면 트렌드 마스터 완료!`
    },
    conceptB: {
      title: `${keyword} 소식을 처음 접한 직장인의 흔한 반응`,
      hook: `야, 너 대박 소식 들었냐? ${keyword} 때문에 다들 난리났대! 🤣`,
      body: `(A가 폰을 보여주며 눈이 동그래진다) "에이, 설마 진짜라고?" / (B가 뒷목을 잡으며) "야 나 어제 그거 샀단 말이야..." / 직장인들이 업무 중 ${keyword} 관련 기사를 보고 깜짝 놀라며 공감대를 형성하는 코믹한 상황 연출.`
    },
    conceptC: {
      title: `난리 난 ${keyword} 논쟁, 여러분의 진짜 선택은?`,
      hook: `솔직히 ${keyword} 관련해서 저는 이 생각밖에 안 드는데, 제 생각이 이상한가요? 🤔`,
      body: `최근 ${keyword}을(를) 두고 의견이 반반으로 치열하게 갈리고 있습니다. 한쪽은 어쩔 수 없다는 현실적 입장이고, 다른 쪽은 말도 안 된다는 비판적 입장입니다. 여러분은 어느 쪽에 더 동의하시나요? 지금 바로 투표하고 의견을 댓글로 달아주세요!`
    }
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
  return '⚠️ 트렌드 기획안 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
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
      console.warn(`[trend-planner] API 재시도 ${attempt + 1}/${MAX_RETRIES - 1} (${waitMs}ms 대기)`);
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
  let trendKeyword = '';

  try {
    const bodyObj = await request.json();
    trendKeyword = bodyObj.trendKeyword || '';

    // IP 기반 Rate Limiter 검증 (1분에 5회 초과 시 200 OK 반환하되 Fallback 연동)
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      console.warn(`[trend-planner] 🚨 Rate limit exceeded for IP: ${ip} (Local Limiter). Returning fallback.`);
      return NextResponse.json({
        success: true,
        data: getFallbackData(trendKeyword),
        fallback: true,
        fallbackReason: 'LOCAL_RATE_LIMIT',
      }, { status: 200 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!trendKeyword || !trendKeyword.trim()) {
      return NextResponse.json(
        { error: { message: '⚠️ 트렌드 키워드/사건(trendKeyword)을 입력해 주세요.' } },
        { status: 400 }
      );
    }

    if (!apiKey) {
      console.error('[trend-planner] GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
      return NextResponse.json(
        { error: { message: '⚠️ 서버 설정 오류입니다. 관리자에게 문의해 주세요.', code: 'API_KEY_MISSING' } },
        { status: 500 }
      );
    }

    // gemini-2.5-flash-lite API 엔드포인트 호출
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    const prompt = `너는 트위터, 인스타그램, 틱톡의 실시간 트렌드를 1초 만에 파악하여 바이럴 영상으로 만들어내는 천재 숏폼 트렌드 마케터야.
제공된 구글 검색 결과를 참조하여, 사용자가 입력한 [트렌드 키워드/사건]에 대한 맥락을 정확히 이해하고 숏폼 기획안 3종 세트를 생성해 줘.

[요청 작업 조건]
1. conceptA (정보 전달형): "이거 모르면 무조건 손해" 구조로 트렌드의 핵심을 쉽고 빠르게 요약 설명하는 대본.
2. conceptB (스킷/공감형): 해당 트렌드를 마주한 대중의 반응이나 상황을 풍자하는 1인 상황극/공감대 형성 대본.
3. conceptC (논쟁 유도형): 댓글 창을 터뜨릴 수 있도록 시청자에게 질문을 던지거나 투표를 유도하는 구조의 대본.

결과는 반드시 아래의 키(key)를 갖는 순수 JSON 형식으로만 반환해 줘. 마크다운 기호(\`\`\`json)나 설명은 절대로 붙이지 마.

{
  "trendSummary": "현재 이 키워드가 왜 화제인지 구글 검색 기반 분석 (1문장)",
  "conceptA": {
    "title": "정보형 타이틀",
    "hook": "도입부 3초 후킹",
    "body": "본문 내용 요약"
  },
  "conceptB": {
    "title": "공감형 타이틀",
    "hook": "상황극 도입부 멘트",
    "body": "상황극 대사 및 지시어"
  },
  "conceptC": {
    "title": "논쟁형 타이틀",
    "hook": "의견 대립 유도 후킹",
    "body": "본문 및 댓글 참여 유도 핵심 질문"
  }
}

[트렌드 키워드/사건]
${trendKeyword}`;

    const requestBody = JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      tools: [{
        googleSearch: {}
      }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    let response: Response;

    try {
      response = await callGeminiWithRetry(targetUrl, requestBody);
    } catch (retryErr: any) {
      // 모든 재시도 소진 → Fallback 샘플 데이터 반환
      if (retryErr?.status === 429) {
        console.warn('[trend-planner] 모든 재시도 소진 → Fallback 샘플 데이터 반환');
        return NextResponse.json({
          success: true,
          data: getFallbackData(trendKeyword),
          fallback: true,
          fallbackReason: 'RATE_LIMIT',
        }, { status: 200 });
      }
      throw retryErr;
    }

    const data = await response.json();

    if (!response.ok) {
      const status = response.status;

      // 429/503 → Fallback 모드 (200 OK)
      if (status === 429 || status === 503) {
        console.warn(`[trend-planner] HTTP ${status} 수신 → Fallback 샘플 데이터 반환`);
        return NextResponse.json({
          success: true,
          data: getFallbackData(trendKeyword),
          fallback: true,
          fallbackReason: status === 429 ? 'RATE_LIMIT' : 'SERVICE_UNAVAILABLE',
        }, { status: 200 });
      }

      console.error(`[trend-planner] Gemini API 오류 (${status}):`, data.error?.message);
      return NextResponse.json({
        success: true,
        data: getFallbackData(trendKeyword),
        fallback: true,
        fallbackReason: 'API_ERROR',
      }, { status: 200 });
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
      
      // 결과 키 검증
      if (!resultObj.trendSummary ||
          !resultObj.conceptA || !resultObj.conceptA.title || !resultObj.conceptA.hook || !resultObj.conceptA.body ||
          !resultObj.conceptB || !resultObj.conceptB.title || !resultObj.conceptB.hook || !resultObj.conceptB.body ||
          !resultObj.conceptC || !resultObj.conceptC.title || !resultObj.conceptC.hook || !resultObj.conceptC.body) {
        throw new Error("INCOMPLETE_JSON");
      }

      return NextResponse.json({ success: true, data: resultObj });
    } catch (parseErr) {
      console.warn("[trend-planner] JSON 파싱 실패 또는 필드 미달. Fallback 데이터를 반환합니다.", outputText);
      return NextResponse.json({
        success: true,
        data: getFallbackData(trendKeyword),
        fallback: true,
        fallbackReason: 'PARSING_ERROR',
      }, { status: 200 });
    }

  } catch (error: any) {
    console.error('[trend-planner] 치명적인 에러 발생:', error);
    // API 에러 시 브라우저 빨간 에러 방지를 위해 status: 200 Fallback 반환
    return NextResponse.json({
      success: true,
      data: getFallbackData(trendKeyword),
      fallback: true,
      fallbackReason: 'FATAL_ERROR',
    }, { status: 200 });
  }
}

export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getClientIp, isRateLimited } from '@/lib/rateLimit';

const MAX_RETRIES = 3;

// ─── Fallback 샘플 데이터 (API 한도 초과 or 에러 시 반환) ───────────────────────────
function getFallbackData(myTopic: string) {
  const topic = myTopic ? myTopic.trim() : '숏폼 콘텐츠';
  console.warn('[reverse-engineer] ⚠️ FALLBACK MODE 활성화 - 샘플 데이터를 반환합니다.');
  return {
    analysis: `원본 대본은 시청자의 결핍을 3초 만에 자극하고 직관적인 해결책을 제시하여 이탈률을 최소화합니다. 핵심 장치로는 호기심을 유발하는 문제 제기와 즉각적인 유익성을 강조하는 구조를 취하고 있습니다.`,
    alternative1: {
      hook: `설마 아직도 ${topic} 이렇게 하고 계신 건 아니죠? ❌`,
      body: `대부분의 사람들이 ${topic}할 때 똑같이 하는 치명적인 실수 3가지가 있습니다. 첫째, 남들과 똑같이 하기. 둘째, 복잡하게 설명하기. 셋째, 타겟층 없이 시작하기. 지금 당장 이 세 가지만 멈추셔도 상위 1%로 올라갑니다.`,
      cta: `더 매운 맛의 ${topic} 노하우가 궁금하다면 지금 팔로우하고 프로필 링크를 확인해 보세요!`
    },
    alternative2: {
      hook: `성공하는 사람들의 ${topic}에는 한 가지 공통점이 있습니다. 💡`,
      body: `효과적인 ${topic}을 위한 3단계 로직을 알려드립니다. 1단계: 타겟 분석을 통한 명확한 컨셉 설정. 2단계: 핵심 가치를 요약한 3초 후킹 설계. 3단계: 즉각적인 피드백을 반영한 점진적 개선. 이 구조만 반복해도 성과가 나옵니다.`,
      cta: `나중에 다시 보시려면 이 영상을 저장하고, 주변에 ${topic}으로 고민하는 친구에게 공유해 주세요.`
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
  return '⚠️ 대본 역설계 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
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
      console.warn(`[reverse-engineer] API 재시도 ${attempt + 1}/${MAX_RETRIES - 1} (${waitMs}ms 대기)`);
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
  let competitorScript = '';
  let myTopic = '';

  try {
    const bodyObj = await request.json();
    competitorScript = bodyObj.competitorScript || '';
    myTopic = bodyObj.myTopic || '';

    // IP 기반 Rate Limiter 검증 (1분에 5회 초과 시 200 OK 반환하되 Fallback 연동)
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      console.warn(`[reverse-engineer] 🚨 Rate limit exceeded for IP: ${ip} (Local Limiter). Returning fallback.`);
      return NextResponse.json({
        success: true,
        data: getFallbackData(myTopic),
        fallback: true,
        fallbackReason: 'LOCAL_RATE_LIMIT',
      }, { status: 200 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!competitorScript || !competitorScript.trim() || !myTopic || !myTopic.trim()) {
      return NextResponse.json(
        { error: { message: '⚠️ 경쟁사 대본과 내 채널 주제를 모두 입력해 주세요.' } },
        { status: 400 }
      );
    }

    if (!apiKey) {
      console.error('[reverse-engineer] GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
      return NextResponse.json(
        { error: { message: '⚠️ 서버 설정 오류입니다. 관리자에게 문의해 주세요.', code: 'API_KEY_MISSING' } },
        { status: 500 }
      );
    }

    // gemini-2.5-flash-lite API 엔드포인트 호출
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    const prompt = `너는 숏폼(쇼츠, 릴스, 틱톡) 알고리즘의 핵심인 시청 유지율(Retention)을 극대화하는 천재 콘텐츠 디렉터이자 카피라이터야. 
사용자가 제공하는 [경쟁사 숏폼 대본]과 [내 채널 주제]를 바탕으로, 해당 영상을 철저히 역설계(Reverse Engineering)하고 벤치마킹 대본을 작성해 줘.

[요청 작업 조건]
1. 분석(analysis): 경쟁사 대본의 3초 후킹 방식, 심리적 이탈 방지 장치, 흥행 공식을 날카롭게 분석해 줘.
2. 변형 대본 1 (alternative1): 원본의 '구조'는 유지하되, 사용자의 [내 채널 주제]에 맞춰 완전히 새로운 카피로 뼈대를 짜줘 (매운맛/자극적 컨셉).
3. 변형 대본 2 (alternative2): 유용한 정보와 신뢰감을 주는 구조로 리라이팅해 줘 (순한맛/정보성 컨셉).

결과는 반드시 아래의 키(key)를 갖는 JSON 형식으로만 반환해 줘. 마크다운 기호(예: \`\`\`json)나 설명은 절대로 붙이지 말고 순수 JSON 텍스트로만 대답해 줘.

{
  "analysis": "경쟁사 대본 흥행 공식 분석 내용 요약 (2-3문장)",
  "alternative1": {
    "hook": "3초 시선 강탈 후킹 멘트",
    "body": "본문 내용 (호흡이 짧고 강렬하게)",
    "cta": "댓글 참여 및 구독 유도 멘트"
  },
  "alternative2": {
    "hook": "신뢰감을 주는 정보성 후킹 멘트",
    "body": "본문 내용 (핵심 정보 요약 구조)",
    "cta": "저장 및 공유 유도 멘트"
  }
}

[경쟁사 숏폼 대본]
${competitorScript}

[내 채널 주제]
${myTopic}`;

    const requestBody = JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
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
        console.warn('[reverse-engineer] 모든 재시도 소진 → Fallback 샘플 데이터 반환');
        return NextResponse.json({
          success: true,
          data: getFallbackData(myTopic),
          fallback: true,
          fallbackReason: 'RATE_LIMIT',
        }, { status: 200 });
      }
      throw retryErr;
    }

    const data = await response.json();

    if (!response.ok) {
      const status = response.status;

      // 429/503 → Fallback 모드 (200 OK 로 반환하여 빨간 에러 방지)
      if (status === 429 || status === 503) {
        console.warn(`[reverse-engineer] HTTP ${status} 수신 → Fallback 샘플 데이터 반환`);
        return NextResponse.json({
          success: true,
          data: getFallbackData(myTopic),
          fallback: true,
          fallbackReason: status === 429 ? 'RATE_LIMIT' : 'SERVICE_UNAVAILABLE',
        }, { status: 200 });
      }

      console.error(`[reverse-engineer] Gemini API 오류 (${status}):`, data.error?.message);
      return NextResponse.json({
        success: true,
        data: getFallbackData(myTopic),
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
      
      // 결과의 key 검증
      if (!resultObj.analysis || !resultObj.alternative1 || !resultObj.alternative2 ||
          !resultObj.alternative1.hook || !resultObj.alternative1.body || !resultObj.alternative1.cta ||
          !resultObj.alternative2.hook || !resultObj.alternative2.body || !resultObj.alternative2.cta) {
        throw new Error("INCOMPLETE_JSON");
      }

      return NextResponse.json({ success: true, data: resultObj });
    } catch (parseErr) {
      console.warn("[reverse-engineer] JSON 파싱 실패 또는 필드 미달. Fallback 데이터를 반환합니다.", outputText);
      return NextResponse.json({
        success: true,
        data: getFallbackData(myTopic),
        fallback: true,
        fallbackReason: 'PARSING_ERROR',
      }, { status: 200 });
    }

  } catch (error: any) {
    console.error('[reverse-engineer] 치명적인 에러 발생:', error);
    // API 에러 시 브라우저 빨간 에러 방지를 위해 status: 200 Fallback 반환
    return NextResponse.json({
      success: true,
      data: getFallbackData(myTopic),
      fallback: true,
      fallbackReason: 'FATAL_ERROR',
    }, { status: 200 });
  }
}

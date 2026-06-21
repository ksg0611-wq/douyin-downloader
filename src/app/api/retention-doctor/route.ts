export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getClientIp, isRateLimited } from '@/lib/rateLimit';

const MAX_RETRIES = 3;

// ─── Fallback 샘플 데이터 (API 한도 초과 or 에러 시 반환) ───────────────────────────
function getFallbackData(scriptDraft: string) {
  console.warn('[retention-doctor] ⚠️ FALLBACK MODE 활성화 - 샘플 데이터를 반환합니다.');
  return {
    hooks: [
      "[샘플] 99%가 모르는 숏폼 알고리즘의 치명적인 비밀 🤫",
      "[샘플] 이 세 가지만 바꾸면 조회수가 10배 폭발합니다 🚀",
      "[샘플] 아직도 대본을 이렇게 쓴다면 당장 멈추세요! ❌"
    ],
    doctoredScript: `[00초: 긴장감 넘치는 효과음과 함께 카메라 줌인] 아직도 조회수 안 나온다고 채널 탓만 하고 계신가요? [03초: 경고음 소리와 붉은색 자막 강조] 문제는 대본의 첫 3초입니다! [06초: 템포 빠른 배경음악 시작] 오늘 알려드린 3단 구조로 후킹 멘트부터 당장 바꾸세요. [10초: 구독 유도 아이콘 노출] 댓글로 고민을 남겨주시면 무료로 진단해 드립니다.`,
    doctorOpinion: [
      "초반 인트로 부분이 3초 이상 길어져 이탈률이 높으니, 첫 문장을 더욱 자극적인 후킹으로 대체하고 1.2배속으로 편집하세요.",
      "본론에서 유용한 정보가 나열될 때 시각적 지루함을 방지하기 위해 2초 간격으로 화면 구도를 클로즈업/풀샷으로 교차 편집하세요."
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
  return '⚠️ 대본 피드백 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
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
      console.warn(`[retention-doctor] API 재시도 ${attempt + 1}/${MAX_RETRIES - 1} (${waitMs}ms 대기)`);
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
  let scriptDraft = '';

  try {
    const bodyObj = await request.json();
    scriptDraft = bodyObj.scriptDraft || '';

    // IP 기반 Rate Limiter 검증 (1분에 5회 초과 시 200 OK 반환하되 Fallback 연동)
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      console.warn(`[retention-doctor] 🚨 Rate limit exceeded for IP: ${ip} (Local Limiter). Returning fallback.`);
      return NextResponse.json({
        success: true,
        data: getFallbackData(scriptDraft),
        fallback: true,
        fallbackReason: 'LOCAL_RATE_LIMIT',
      }, { status: 200 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!scriptDraft || !scriptDraft.trim()) {
      return NextResponse.json(
        { error: { message: '⚠️ 대본 초안(scriptDraft)을 입력해 주세요.' } },
        { status: 400 }
      );
    }

    if (!apiKey) {
      console.error('[retention-doctor] GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
      return NextResponse.json(
        { error: { message: '⚠️ 서버 설정 오류입니다. 관리자에게 문의해 주세요.', code: 'API_KEY_MISSING' } },
        { status: 500 }
      );
    }

    // gemini-2.5-flash-lite API 엔드포인트 호출
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    const prompt = `너는 숏폼(쇼츠, 릴스, 틱톡) 콘텐츠의 '시청 유지율(Retention)'을 심폐소생하는 대한민국 최고의 숏폼 전문 영상 감독이자 편집자야.
사용자가 입력한 [대본 초안]을 분석하여, 이탈율을 막고 조회수를 폭발시킬 수 있도록 리라이팅 및 편집 연출 지시를 내려줘.

[요청 작업 조건]
1. hooks: 영상 시작 3초 만에 유저의 스크롤을 멈추게 할 강렬한 후킹 멘트 3가지를 배열 형태로 제안해 줘.
2. doctoredScript: 원본 대본의 흐름을 다듬어 가독성을 높이고, 문장 사이사이에 이탈을 방지할 편집 지시어(예: [03초:효과음 '띵'과 자막 강조], [07초:화면 줌인])를 대괄호 형태로 정밀하게 삽입한 최종 대본을 완성해 줘.
3. doctorOpinion: 이 대본의 가장 지루했던 부분과 시청 유지율을 높이기 위해 촬영/편집 시 주의해야 할 핵심 조언을 2가지 작성해 줘.

결과는 반드시 아래의 키(key)를 갖는 순수 JSON 형식으로만 반환해 줘. 마크다운 기호(\`\`\`json)나 앞뒤 설명은 절대로 붙이지 마.

{
  "hooks": [
    "후킹 멘트 1 (자극적/의문형)",
    "후킹 멘트 2 (이익 제시형)",
    "후킹 멘트 3 (공포 유발/금지어)"
  ],
  "doctoredScript": "[00초: 빠른 화면 전환과 함께] 후킹멘트 입력... [03초: 효과음과 함께 반전 그래픽] 본문 내용...",
  "doctorOpinion": [
    "초반 OO 부분이 지루하여 이탈 위험이 높으니 템포를 1.2배속으로 편집하세요.",
    "댓글 참여를 유도하기 위해 엔딩 크레딧 직전에 투표 질문 자막을 넣으세요."
  ]
}

[대본 초안]
${scriptDraft}`;

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
        console.warn('[retention-doctor] 모든 재시도 소진 → Fallback 샘플 데이터 반환');
        return NextResponse.json({
          success: true,
          data: getFallbackData(scriptDraft),
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
        console.warn(`[retention-doctor] HTTP ${status} 수신 → Fallback 샘플 데이터 반환`);
        return NextResponse.json({
          success: true,
          data: getFallbackData(scriptDraft),
          fallback: true,
          fallbackReason: status === 429 ? 'RATE_LIMIT' : 'SERVICE_UNAVAILABLE',
        }, { status: 200 });
      }

      console.error(`[retention-doctor] Gemini API 오류 (${status}):`, data.error?.message);
      return NextResponse.json({
        success: true,
        data: getFallbackData(scriptDraft),
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
      if (!Array.isArray(resultObj.hooks) || resultObj.hooks.length < 3 ||
          !resultObj.doctoredScript ||
          !Array.isArray(resultObj.doctorOpinion) || resultObj.doctorOpinion.length < 2) {
        throw new Error("INCOMPLETE_JSON");
      }

      return NextResponse.json({ success: true, data: resultObj });
    } catch (parseErr) {
      console.warn("[retention-doctor] JSON 파싱 실패 또는 필드 미달. Fallback 데이터를 반환합니다.", outputText);
      return NextResponse.json({
        success: true,
        data: getFallbackData(scriptDraft),
        fallback: true,
        fallbackReason: 'PARSING_ERROR',
      }, { status: 200 });
    }

  } catch (error: any) {
    console.error('[retention-doctor] 치명적인 에러 발생:', error);
    // API 에러 시 브라우저 빨간 에러 방지를 위해 status: 200 Fallback 반환
    return NextResponse.json({
      success: true,
      data: getFallbackData(scriptDraft),
      fallback: true,
      fallbackReason: 'FATAL_ERROR',
    }, { status: 200 });
  }
}

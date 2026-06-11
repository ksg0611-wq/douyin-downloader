export const runtime = 'edge';

import { NextResponse } from 'next/server';

const MAX_RETRIES = 3;

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
  return '⚠️ AI 제안서 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
}

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

  const limitError = new Error('RATE_LIMIT_EXCEEDED');
  (limitError as any).status = 429;
  throw limitError;
}

export async function POST(request: Request) {
  try {
    const { channelTopic, targetAudience, targetBrand } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!channelTopic || !channelTopic.trim()) {
      return NextResponse.json(
        { error: { message: '⚠️ 채널 주제를 입력해 주세요.' } },
        { status: 400 }
      );
    }
    if (!targetAudience || !targetAudience.trim()) {
      return NextResponse.json(
        { error: { message: '⚠️ 주요 시청자층을 입력해 주세요.' } },
        { status: 400 }
      );
    }
    if (!targetBrand || !targetBrand.trim()) {
      return NextResponse.json(
        { error: { message: '⚠️ 타겟 브랜드를 입력해 주세요.' } },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: { message: '⚠️ 서버 설정 오류입니다. 관리자에게 문의해 주세요.', code: 'API_KEY_MISSING' } },
        { status: 500 }
      );
    }

    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

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
- 채널 주제: ${channelTopic}
- 주요 시청자층: ${targetAudience}
- 협찬받고 싶은 타겟 브랜드: ${targetBrand}`;

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
      console.warn("JSON parsing failed, falling back to backup logic", outputText);
      return NextResponse.json({
        success: true,
        data: {
          subject: `[협찬 제안] ${channelTopic} 전문 크리에이터와 ${targetBrand}의 협업을 제안드립니다.`,
          greeting: `안녕하세요, ${targetBrand} 마케팅 팀 담당자님.\n\n저는 ${targetAudience} 오디언스를 기반으로 다양한 ${channelTopic} 콘텐츠를 전문적으로 연출하며 시청자분들과 활발히 소통 중인 크리에이터입니다.`,
          channelAppeal: `저희 채널은 ${channelTopic} 분야에서 실제 시청자가 일상에 즉시 참고할 만한 밀도 높은 정보를 다룹니다. 특히 주요 구독자층의 ${targetAudience} 비중이 약 80% 이상을 차지하며, 활발한 피드백과 소통 중심의 높은 도달율을 자랑하고 있습니다.`,
          synergy: `${targetBrand}이(가) 추구하는 브랜드 철학과 저희 채널의 주 오디언스 라이프스타일은 매우 강력한 시너지를 낼 수 있다고 확신합니다. 진정성 있는 실생활 라이브 활용 예시를 통해 핵심 가치를 가장 세련되게 전달해 드리겠습니다.`,
          concept: `[추천 기획안 - 숏폼 챌린지 룩]\n- 컨셉: 숏폼에 최적화된 3초 후킹 도입부로 시청자 시선 고정\n- 내용: ${targetBrand} 제품을 활용하여 바쁜 ${targetAudience} 오디언스가 실제 생활 속에서 문제를 즉시 해결하거나 가치를 느끼는 과정을 트렌디한 BGM에 맞춰 컷편집 형태로 전개\n- CTA: 고정 댓글 링크 연결을 통해 브랜드 공식 몰이나 기획전 유입을 자연스럽게 유도`,
          closing: `긍정적인 방향으로 브랜드 마케팅 성과를 낼 수 있도록 세밀하게 협력하고 싶습니다. 본 제안에 대한 긍정적인 검토 부탁드리며, 추가 상세 지표 자료나 제작 조건 협의는 본 메일로 답변 주시면 감사하겠습니다.\n\n감사합니다.\n크리에이터 드림.`
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

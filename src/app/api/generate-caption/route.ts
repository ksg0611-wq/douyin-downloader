import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: { message: "API_KEY_MISSING" } }, { status: 500 });
    }

    // gemini-1.5-flash/2.0-flash는 2026년 폐기됨 → 최신 gemini-3.5-flash 사용
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `너는 10년 차 숏폼 바이럴 마케터야. 다음 주어진 영상 제목을 바탕으로 틱톡, 인스타그램 릴스에 올리기 좋은 시선을 끄는 한국어 캡션(3문장 내외)과 검색 노출에 최적화된 해시태그 5~7개를 추천해 줘. 이모지를 적절히 섞어줘. 영상 제목: ${title}`
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: { message: data.error?.message || "Google API Error" } }, { status: response.status });
    }

    const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || "콘텐츠를 생성할 수 없습니다.";
    // 하위 호환성을 위해 success, text 필드도 함께 반환
    return NextResponse.json({ 
      success: true, 
      text: outputText, 
      caption: outputText 
    });

  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}

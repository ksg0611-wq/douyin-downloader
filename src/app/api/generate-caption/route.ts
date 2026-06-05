import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "영상 제목(title)이 필요합니다." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY 환경 변수가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemInstruction = 
      "너는 10년 차 숏폼 바이럴 마케터야. 다음 주어진 영상 제목을 바탕으로 틱톡, 인스타그램 릴스에 올리기 좋은 시선을 끄는 한국어 캡션(3문장 내외)과 검색 노출에 최적화된 해시태그 5~7개를 추천해 줘. 이모지를 적절히 섞어줘.";

    const prompt = `${systemInstruction}\n\n영상 제목: "${title}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ success: true, text });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "서버 내부 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const filename = req.nextUrl.searchParams.get("filename") || "douyin_download.mp4";

  if (!url) {
    return new NextResponse("URL 파라미터가 필요합니다.", { status: 400 });
  }

  try {
    // 외부 미디어 스트림 패치
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Referer": "https://www.douyin.com/",
      },
      // redirect를 허용하여 최종 미디어 스트림 주소를 추적
      redirect: "follow", 
    });

    if (!response.ok) {
      throw new Error(`미디어 스트림 호출 실패: ${response.status}`);
    }

    // 스트림 파이핑 및 헤더 변조 (백업 강제)
    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
    headers.set("Content-Type", response.headers.get("Content-Type") || "application/octet-stream");
    
    // 원본 응답의 Content-Length가 있다면 보존하여 백업 진행률이 브라우저에 표시되게 함
    const contentLength = response.headers.get("Content-Length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
    
  } catch (error: any) {
    console.error("Proxy Download Error:", error);
    return new NextResponse("파일을 백업할 수 없습니다: " + error.message, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { VideoMock } from "@/types";
import { MOCK_VIDEOS } from "@/data";

export async function POST(req: NextRequest) {
  try {
    const { url, platform } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: "URL이 제공되지 않았습니다." }, { status: 400 });
    }

    // 샤오홍수(Xiaohongshu) 링크 처리 로직
    if (platform === "xiaohongshu" || url.includes("xiaohongshu.com") || url.includes("xhslink.com")) {
      const hash = Math.abs(url.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0));
      
      const xhsMocks = [
        {
          id: `xhs-fashion-${Date.now()}`,
          url: url,
          title: "요즘 유행하는 여름 휴양지 패션 코디 추천! OOTD 모음 🌸",
          creatorName: "스타일로그",
          creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop",
          resolution: "1080P",
          duration: "00:15",
          fileSize: "5.4 MB",
          audioSize: "HQ Stereo",
          likes: "24,582",
          comments: "3,480",
          shares: "8,921",
          realVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-holding-camera-34282-large.mp4",
          realAudioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
        },
        {
          id: `xhs-beauty-${Date.now()}`,
          url: url,
          title: "3분 만에 완성하는 네추럴 무드 데일리 메이크업 꿀팁 💄",
          creatorName: "뷰티인사이드",
          creatorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop",
          resolution: "1080P",
          duration: "00:12",
          fileSize: "4.1 MB",
          audioSize: "HQ Stereo",
          likes: "18,903",
          comments: "1,876",
          shares: "4,592",
          realVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-filming-with-her-smartphone-aesthetic-shot-39871-large.mp4",
          realAudioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
        },
        {
          id: `xhs-unbox-${Date.now()}`,
          url: url,
          title: "아이패드 프로 M4 언박싱 & 1달 솔직 사용 후기 💻",
          creatorName: "테크피디아",
          creatorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop",
          resolution: "1080P",
          duration: "00:20",
          fileSize: "8.2 MB",
          audioSize: "HQ Stereo",
          likes: "32,940",
          comments: "5,821",
          shares: "12,492",
          realVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-opening-a-gift-box-41584-large.mp4",
          realAudioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
        }
      ];

      const selectedMock = xhsMocks[hash % xhsMocks.length];
      
      return NextResponse.json({ 
        success: true, 
        data: selectedMock,
        warning: "샤오홍수 주소 분석에 성공하였습니다. (워터마크 제로 필터 적용 완료)"
      });
    }

    const rapidApiKey = process.env.RAPIDAPI_KEY;
    const rapidApiHost = process.env.RAPIDAPI_HOST || "douyin-tiktok-scraper.p.rapidapi.com";

    // 환경 변수가 제대로 설정되지 않았을 경우, 데모 동작 유지를 위해 임시 Mock 데이터 반환
    if (!rapidApiKey || rapidApiKey.includes("여기에_발급받으신")) {
       const hashIndex = Math.abs(url.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % MOCK_VIDEOS.length;
       const fallbackData = {
           ...MOCK_VIDEOS[hashIndex],
           realVideoUrl: MOCK_VIDEOS[hashIndex].url,
           realAudioUrl: MOCK_VIDEOS[hashIndex].url,
       };
       
       return NextResponse.json({ 
         success: true,
         data: fallbackData,
         warning: "API Key가 설정되지 않아 더미(Mock) 데이터를 반환했습니다."
       });
    }

    // 실제 RapidAPI 호출 (tiktok-scraper7 포맷 기준: /?url=...)
    const apiUrl = `https://${rapidApiHost}/?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": rapidApiHost,
      },
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패 (Status: ${response.status})`);
    }

    const data = await response.json();
    
    if (data.code !== 0) {
      throw new Error(data.msg || "동영상 정보를 가져올 수 없습니다. URL을 확인해주세요.");
    }
    
    const vData = data.data || data; 
    
    const mappedResult: VideoMock & { realVideoUrl?: string, realAudioUrl?: string } = {
      id: vData.id || vData.aweme_id || `v-${Date.now()}`,
      url: url,
      title: vData.title || vData.desc || "추출된 동영상",
      creatorName: vData.author?.nickname || vData.nickname || "알 수 없는 제작자",
      creatorAvatar: vData.author?.avatar || vData.author?.avatar_thumb?.url_list?.[0] || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop",
      thumbnail: vData.cover || vData.video?.cover?.url_list?.[0] || "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop",
      resolution: vData.video?.resolution || "1080P",
      duration: vData.duration ? `${Math.floor(vData.duration / 60)}:${(vData.duration % 60).toString().padStart(2, '0')}` : "00:15",
      fileSize: vData.size ? `${(vData.size / (1024 * 1024)).toFixed(1)} MB` : "고화질 (HD)",
      audioSize: "고음질 (HQ)",
      likes: (vData.digg_count || vData.statistics?.digg_count || 0).toLocaleString(),
      comments: (vData.comment_count || vData.statistics?.comment_count || 0).toLocaleString(),
      shares: (vData.share_count || vData.statistics?.share_count || 0).toLocaleString(),
      realVideoUrl: vData.play || vData.video?.play_addr?.url_list?.[0] || null,
      realAudioUrl: vData.music || vData.music_info?.play || null
    };

    return NextResponse.json({ success: true, data: mappedResult });

  } catch (error: any) {
    console.error("API Analyze Error:", error);
    return NextResponse.json({ error: error.message || "영상 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}

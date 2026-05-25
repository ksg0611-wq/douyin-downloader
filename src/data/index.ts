import { VideoMock } from "../types";

export const MOCK_VIDEOS: VideoMock[] = [
  {
    id: "v1",
    url: "https://v.douyin.com/iyR8xP9q/",
    title: "아름다운 밤거리 시네마틱 뷰",
    creatorName: "Seoul_Vibes",
    creatorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop",
    resolution: "1080P",
    duration: "00:15",
    fileSize: "4.2 MB",
    audioSize: "1.1 MB",
    likes: "124K",
    comments: "2.1K",
    shares: "5.4K"
  },
  {
    id: "v2",
    url: "https://v.douyin.com/iyR8xP9q/recipes",
    title: "초간단 홈카페 레시피 모음",
    creatorName: "Daily_Cook",
    creatorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1495474472207-464a8d960f28?w=600&auto=format&fit=crop",
    resolution: "4K",
    duration: "01:20",
    fileSize: "18.5 MB",
    audioSize: "3.2 MB",
    likes: "89K",
    comments: "1.5K",
    shares: "2.2K"
  },
  {
    id: "v3",
    url: "https://v.douyin.com/iyR8xP9q/beijing",
    title: "네온사인 빛나는 도시 야경 타임랩스",
    creatorName: "CyberPunk_City",
    creatorAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?w=600&auto=format&fit=crop",
    resolution: "1080P",
    duration: "00:30",
    fileSize: "8.1 MB",
    audioSize: "1.8 MB",
    likes: "256K",
    comments: "4.3K",
    shares: "12K"
  },
  {
    id: "v4",
    url: "https://v.douyin.com/iyR8xP9q/panda",
    title: "아기 판다 푸바오 귀여운 먹방",
    creatorName: "Panda_Lovers",
    creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=600&auto=format&fit=crop",
    resolution: "720P",
    duration: "00:45",
    fileSize: "5.5 MB",
    audioSize: "2.1 MB",
    likes: "450K",
    comments: "12K",
    shares: "45K"
  }
];

export const FAQS = [
  {
    id: "faq-1",
    question: "진짜 워터마크가 완벽히 제거되나요?",
    answer: "네, 맞습니다. 저희 시스템은 Douyin 서버에서 원본 비디오 파일에 워터마크(로고, 계정명 등)를 합성하기 전 단계의 무손실 원본 스트림을 직접 추출하여 제공하므로, 티끌 하나 없는 깨끗한 영상을 다운로드하실 수 있습니다."
  },
  {
    id: "faq-2",
    question: "아이폰이나 안드로이드 스마트폰에서도 사용할 수 있나요?",
    answer: "물론입니다. 별도의 앱 설치 없이 사파리, 크롬 등 스마트폰 기본 브라우저에서 동일하게 이용 가능합니다. 다운로드한 비디오는 기기의 '사진(갤러리)' 앱이나 '다운로드' 폴더에 바로 저장됩니다."
  },
  {
    id: "faq-3",
    question: "다운로드 시 화질 저하가 발생하나요?",
    answer: "아니요. 원본 업로더가 업로드한 최고 해상도(최대 4K) 포맷을 압축 없이 그대로 전송합니다. 따라서 화질 손실이나 프레임 저하가 전혀 발생하지 않습니다."
  },
  {
    id: "faq-4",
    question: "사용 횟수 제한이나 요금이 있나요?",
    answer: "완전 무료이며 횟수 제한도 없습니다. 저희 서비스는 하단에 표시되는 최소한의 광고 수익만으로 유지되고 있어 누구나 무제한으로 사용하실 수 있습니다."
  }
];

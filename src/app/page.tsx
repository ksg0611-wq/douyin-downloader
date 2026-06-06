"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MOCK_VIDEOS } from "@/data";
import { VideoMock, DownloadHistory as DownloadHistoryType } from "@/types";

import Header from "@/components/layout/Header";
import AdBanner from "@/components/layout/AdBanner";
import Footer from "@/components/layout/Footer";


import HeroSection from "@/components/home/HeroSection";
import DownloaderCore from "@/components/home/DownloaderCore";
import DownloadResult from "@/components/home/DownloadResult";
import FeaturesGuide from "@/components/home/FeaturesGuide";
import DownloadHistory from "@/components/home/DownloadHistory";
import FAQSection from "@/components/home/FAQSection";
import HashtagTrendAnalyzer from "@/components/home/HashtagTrendAnalyzer";
import GlobalTranslator from "@/components/home/GlobalTranslator";
import RevenueSimulator from "@/components/home/RevenueSimulator";
import ToolModal from "@/components/home/ToolModal";
import SafeZonePreviewer from "@/components/home/SafeZonePreviewer";
import BPMCalculator from "@/components/home/BPMCalculator";
import ShadowbanScanner from "@/components/home/ShadowbanScanner";
import HookGenerator from "@/components/home/HookGenerator";

import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, limit, deleteDoc, doc } from "firebase/firestore";

const TOOLS = [
  {
    id: "hashtag",
    title: "실시간 해시태그 트렌드 분석기",
    titleEn: "Real-time Hashtag Trend Analyzer",
    desc: "중국/글로벌 해시태그 유입량, 경쟁도, 연관 태그를 정밀 분석하여 영상 노출 확률을 극대화합니다.",
    descEn: "Analyze hashtag search volumes, competition levels, and related keywords to maximize video reach.",
    icon: "📊",
    badge: "AI",
    badgeColor: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30",
  },
  {
    id: "translator",
    title: "다국어 숏폼 제목 번역",
    titleEn: "Global Title Translator",
    desc: "해외 인기 숏폼 문법에 최적화된 영어, 일본어, 베트남어 제목 번역과 AI 바이럴 피드백을 제공합니다.",
    descEn: "Translate and optimize video titles into English, Japanese, and Vietnamese using viral marketing patterns.",
    icon: "🌐",
    badge: "NEW",
    badgeColor: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30",
  },
  {
    id: "revenue",
    title: "숏폼 예상 수익 시뮬레이터",
    titleEn: "Revenue Simulator",
    desc: "조회수와 카테고리를 설정하여 순수익 및 브랜드 협찬 광고 제안 단가를 즉시 시뮬레이션합니다.",
    descEn: "Simulate estimated ad revenue and branded sponsorship negotiation rates based on views and categories.",
    icon: "💰",
    badge: "POPULAR",
    badgeColor: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30",
  },
  {
    id: "safe-zone",
    title: "숏폼 안전 영역 프리뷰어",
    titleEn: "Short-form Safe Zone Previewer",
    desc: "유저 이미지를 업로드하여 틱톡, 쇼츠, 릴스, 도우인의 UI 가이드라인 오버레이 가려짐을 실시간 테스트합니다.",
    descEn: "Upload images to test safe zones and UI layouts on TikTok, YouTube Shorts, Reels, and Douyin in real time.",
    icon: "📱",
    badge: "NEW",
    badgeColor: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30",
  },
  {
    id: "bpm-calculator",
    title: "숏폼 BGM 컷편집 계산기",
    titleEn: "BGM Beat-Sync Editor",
    desc: "음악 비트에 맞춰 화면을 탭하면 실시간 BPM을 측정하고 비디오 싱크 컷편집에 알맞은 정확한 초(Seconds) 단위를 계산합니다.",
    descEn: "Tap to the music beats to measure real-time BPM and calculate precise cut durations (1/2/4 beat cuts) in seconds.",
    icon: "🎵",
    badge: "NEW",
    badgeColor: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30",
  },
  {
    id: "shadowban-scanner",
    title: "섀도우밴 위험 단어 스캐너",
    titleEn: "Shadowban Word Scanner",
    desc: "동영상 제목, 설명글, 혹은 자막 텍스트 내 알고리즘 노출 제한을 유발하는 민감 키워드를 실시간 스캔하여 우회 대체할 수 있게 돕습니다.",
    descEn: "Scan transcript captions for sensitive words that trigger shadowbans on TikTok or Douyin, helping you rewrite safely.",
    icon: "🛡️",
    badge: "NEW",
    badgeColor: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30",
  },
  {
    id: "hook-generator",
    title: "3초 후킹 대본 생성기",
    titleEn: "3-Second Hook Generator",
    desc: "영상 주제만 입력하면, 시청자의 시선을 3초 안에 사로잡을 3대 스타일의 도입부 대본을 AI가 즉시 자동 생성합니다.",
    descEn: "Enter a topic to generate 3-second viral script hooks (facts, empathy, questions) using Gemini AI.",
    icon: "🪄",
    badge: "AI",
    badgeColor: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30",
  }
];

export default function Home() {
  const [activeTool, setActiveTool] = useState<"hashtag" | "translator" | "revenue" | "safe-zone" | "bpm-calculator" | "shadowban-scanner" | "hook-generator" | null>(null);
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState<"douyin" | "xiaohongshu">("douyin");
  const [lang, setLang] = useState<"ko" | "en">("ko");
  const [errorMessage, setErrorMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<VideoMock | null>(null);

  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadCompleted, setDownloadCompleted] = useState(false);
  const [downloadType, setDownloadType] = useState<"video" | "audio" | null>(null);

  const [guestUserId, setGuestUserId] = useState<string | null>(null);
  const [historyList, setHistoryList] = useState<DownloadHistoryType[]>([]);
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("faq-1");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<VideoMock | null>(null);

  const [downloadSessionCount, setDownloadSessionCount] = useState(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        showToast("클립보드 주소가 입력되었습니다!");
      }
    } catch (err) {
      showToast("마우스를 사용해서 입력창에 붙여넣어 주세요.");
    }
  };

  useEffect(() => {
    // 1. guestUserId가 없다면 생성 및 캐싱
    let userId = localStorage.getItem("douyin_guest_user_id");
    if (!userId) {
      userId = "guest_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem("douyin_guest_user_id", userId);
    }
    setGuestUserId(userId);

    // 2. LocalStorage에서 먼저 로드 (즉시 UI 렌더링)
    const cached = localStorage.getItem("douyin_download_history");
    let localHistory: DownloadHistoryType[] = [];
    if (cached) {
      try {
        localHistory = JSON.parse(cached);
        setHistoryList(localHistory);
      } catch (e) {
        // Safe bypass
      }
    }

    // 3. Firestore에서 최신 이력 10개 동기화 (유기적 싱크)
    if (db && userId) {
      const fetchFirestoreHistory = async () => {
        try {
          const q = query(
            collection(db, "download_history"),
            where("guestUserId", "==", userId),
            orderBy("timestamp", "desc"),
            limit(10)
          );
          const querySnapshot = await getDocs(q);
          const firestoreItems: DownloadHistoryType[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            firestoreItems.push({
              id: doc.id, // Firestore 문서 ID를 item.id로 보존하여 삭제 시 활용
              url: data.url,
              title: data.title,
              creatorName: data.creatorName,
              thumbnail: data.thumbnail,
              downloadedAt: data.downloadedAt,
              videoData: data.videoData
            });
          });

          if (firestoreItems.length > 0) {
            setHistoryList(firestoreItems);
            localStorage.setItem("douyin_download_history", JSON.stringify(firestoreItems));
          } else if (localHistory.length > 0) {
            // Firestore가 비어있고 Local 이력이 있으면 Firestore로 최초 업로드
            for (const item of localHistory) {
              await addDoc(collection(db, "download_history"), {
                guestUserId: userId,
                url: item.url,
                title: item.title,
                creatorName: item.creatorName,
                thumbnail: item.thumbnail,
                downloadedAt: item.downloadedAt,
                videoData: item.videoData || null,
                timestamp: Date.now()
              });
            }
          }
        } catch (error) {
          console.error("Error syncing with Firestore:", error);
        }
      };
      fetchFirestoreHistory();
    }
  }, []);

  useEffect(() => {
    // 4. URL 쿼리 파라미터 처리 (블로그 CTA 등에서 유입 시 해당 툴 즉시 활성화 및 스크롤)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const toolParam = params.get("tool");
      const scrollParam = params.get("scroll");

      if (toolParam && ["hashtag", "translator", "revenue", "safe-zone", "bpm-calculator", "shadowban-scanner", "hook-generator"].includes(toolParam)) {
        setActiveTool(toolParam as any);
        setTimeout(() => {
          const el = document.getElementById("available-tools");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 300);
      } else if (scrollParam === "downloader") {
        setTimeout(() => {
          const el = document.getElementById("downloader-core");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 300);
      }
    }
  }, []);

  const saveToHistory = async (video: VideoMock) => {
    const userId = localStorage.getItem("douyin_guest_user_id") || guestUserId;

    const newItem: DownloadHistoryType = {
      id: `${video.id}-${Date.now()}`,
      url: video.url,
      title: video.title,
      creatorName: video.creatorName,
      thumbnail: video.thumbnail,
      downloadedAt: new Date().toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      videoData: video
    };

    // 로컬스토리지 즉시 업데이트
    const updated = [newItem, ...historyList.filter(item => item.url !== video.url)].slice(0, 10);
    setHistoryList(updated);
    localStorage.setItem("douyin_download_history", JSON.stringify(updated));

    // 파이어베이스 Firestore 저장 및 중복 제거
    if (db && userId) {
      try {
        const q = query(
          collection(db, "download_history"),
          where("guestUserId", "==", userId),
          where("url", "==", video.url)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          querySnapshot.forEach(async (docSnapshot) => {
            await deleteDoc(doc(db, "download_history", docSnapshot.id));
          });
        }

        await addDoc(collection(db, "download_history"), {
          guestUserId: userId,
          url: newItem.url,
          title: newItem.title,
          creatorName: newItem.creatorName,
          thumbnail: newItem.thumbnail,
          downloadedAt: newItem.downloadedAt,
          videoData: video,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error("Error writing to Firestore:", error);
      }
    }
  };

  const deleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = historyList.filter(item => item.id !== id);
    setHistoryList(updated);
    localStorage.setItem("douyin_download_history", JSON.stringify(updated));
    showToast("기록이 삭제되었습니다.");

    if (db) {
      try {
        await deleteDoc(doc(db, "download_history", id));
      } catch (error) {
        console.error("Error deleting from Firestore:", error);
      }
    }
  };

  const clearAllHistory = async () => {
    setHistoryList([]);
    localStorage.removeItem("douyin_download_history");
    showToast("모든 다운로드 기록이 삭제되었습니다.");

    const userId = localStorage.getItem("douyin_guest_user_id") || guestUserId;
    if (db && userId) {
      try {
        const q = query(
          collection(db, "download_history"),
          where("guestUserId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (docSnapshot) => {
          await deleteDoc(doc(db, "download_history", docSnapshot.id));
        });
      } catch (error) {
        console.error("Error clearing Firestore history:", error);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setErrorMessage(
        platform === "douyin"
          ? (lang === "ko" ? "Douyin 비디오 주소를 정확히 입력해 주세요." : "Please enter a valid Douyin video URL.")
          : (lang === "ko" ? "Xiaohongshu 주소를 정확히 입력해 주세요." : "Please enter a valid Xiaohongshu URL.")
      );
      return;
    }

    // 예외 처리:
    if (platform === "xiaohongshu" && (url.includes("douyin.com") || url.includes("v.douyin"))) {
      setErrorMessage(lang === "ko" ? "올바른 샤오홍슈 링크가 아닙니다." : "Not a valid Xiaohongshu link.");
      showToast(lang === "ko" ? "올바른 샤오홍슈 링크가 아닙니다." : "Not a valid Xiaohongshu link.");
      return;
    }

    if (platform === "douyin" && (url.includes("xiaohongshu.com") || url.includes("xhslink.com"))) {
      setErrorMessage(lang === "ko" ? "올바른 도우인 링크가 아닙니다." : "Not a valid Douyin link.");
      showToast(lang === "ko" ? "올바른 도우인 링크가 아닙니다." : "Not a valid Douyin link.");
      return;
    }

    setErrorMessage("");
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setAnalysisResult(null);
    setDownloadProgress(null);
    setDownloadCompleted(false);

    // 가짜 진행 단계 시뮬레이션
    const interval = setInterval(() => {
      setAnalysisStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 650);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, platform })
      });
      
      const data = await response.json();
      clearInterval(interval);
      setAnalysisStep(4);

      if (!response.ok || !data.success) {
        throw new Error(data.error || "분석 중 서버 에러가 발생했습니다.");
      }

      setAnalysisResult(data.data);
      saveToHistory(data.data);
      setDownloadSessionCount(c => c + 1);
      showToast(data.warning || `${platform === "douyin" ? "Douyin" : "Xiaohongshu"} ${lang === "ko" ? "분석 완료!" : "Analysis Complete!"}`);
      
    } catch (err: any) {
      clearInterval(interval);
      setErrorMessage(err.message);
      showToast(lang === "ko" ? "분석에 실패했습니다." : "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickDemo = (demoUrl: string) => {
    setUrl(demoUrl);
    setErrorMessage("");
    showToast(lang === "ko" ? "데모 주소가 입력되었습니다. '다운로드'를 클릭하세요!" : "Demo URL entered. Click 'Download'!");
  };

  const triggerDownloadAction = (type: "video" | "audio") => {
    if (!analysisResult) return;
    
    const targetUrl = type === "video" ? analysisResult.realVideoUrl : analysisResult.realAudioUrl;
    
    if (!targetUrl) {
       showToast(lang === "ko" ? "다운로드할 수 있는 원본 미디어 링크가 없습니다." : "No original media link available for download.");
       return;
    }

    setDownloadType(type);
    setDownloadCompleted(false);
    setDownloadProgress(0);

    const ext = type === "video" ? "mp4" : "mp3";
    const filename = `${analysisResult.id}_douyin_no_watermark.${ext}`;
    const proxyUrl = `/api/download?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(filename)}`;
    
    const stepInterval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 90) return 90; // Wait at 90% until it actually downloads
        const add = Math.floor(Math.random() * 15) + 5;
        return Math.min(prev + add, 90);
      });
    }, 250);

    // 트리거 Native 브라우저 다운로드
    const link = document.createElement("a");
    link.href = proxyUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // UI 애니메이션 완료
    setTimeout(() => {
       clearInterval(stepInterval);
       setDownloadProgress(100);
       setDownloadCompleted(true);
       showToast(type === "video" 
         ? (lang === "ko" ? "MP4 비디오 저장 시작!" : "MP4 Video download started!")
         : (lang === "ko" ? "오디오 트랙 추출 시작!" : "Audio track extraction started!"));
       setTimeout(() => setDownloadProgress(null), 3000);
    }, 1500);
  };

  const handleReset = () => {
    setUrl("");
    setAnalysisResult(null);
    setDownloadProgress(null);
    setDownloadCompleted(false);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-50 text-zinc-800 dark:bg-[#060609] dark:text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-white transition-colors duration-300">
      
      {/* Absolute Atmospheric Lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-violet-600/5 dark:bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <Header lang={lang} setLang={setLang} />

      <main id="app-main" className="flex-grow max-w-6xl w-full mx-auto px-4 py-6 md:py-10 z-10">
        {/* <AdBanner position="top" /> */} {/* 구글 애드센스 승인 완료 시 주석 해제하여 활성화 */}

        <HeroSection lang={lang} />



        <DownloaderCore 
          url={url} 
          setUrl={setUrl} 
          errorMessage={errorMessage} 
          setErrorMessage={setErrorMessage}
          isAnalyzing={isAnalyzing} 
          handleAnalyze={handleAnalyze} 
          handlePaste={handlePaste} 
          handleQuickDemo={handleQuickDemo}
          analysisStep={analysisStep}
          platform={platform}
          setPlatform={setPlatform}
          lang={lang}
        />

        {/* <AdBanner position="bottom" /> */} {/* 구글 애드센스 승인 완료 시 주석 해제하여 활성화 (하단 Mock Slot) */}

        <AnimatePresence>
          {analysisResult && (
            <DownloadResult 
              analysisResult={analysisResult} 
              downloadProgress={downloadProgress} 
              downloadCompleted={downloadCompleted} 
              downloadType={downloadType} 
              setPreviewVideo={setPreviewVideo} 
              triggerDownloadAction={triggerDownloadAction}
              handleReset={handleReset}
              showToast={showToast}
            />
          )}
        </AnimatePresence>

        <FeaturesGuide />

        <DownloadHistory 
          historyList={historyList} 
          clearAllHistory={clearAllHistory} 
          deleteHistoryItem={deleteHistoryItem} 
          handleHistoryClick={(item) => {
            if (item.videoData) {
              setAnalysisResult(item.videoData);
              setUrl(item.url);
              window.scrollTo({ top: 400, behavior: "smooth" });
              showToast("이전 분석 결과를 즉시 로드했습니다! ⚡");
            } else {
              setUrl(item.url);
              window.scrollTo({ top: 120, behavior: "smooth" });
              showToast("주소가 붙여 넣어졌습니다. 다운로드 버튼을 클릭하세요!");
            }
          }} 
        />

        {/* Available Tools (크리에이터 필수 도구) 카드형 그리드 */}
        <section id="available-tools" className="max-w-4xl mx-auto mt-14 mb-10 px-2 sm:px-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
            <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              {lang === "ko" ? "Available Tools (크리에이터 필수 도구)" : "Available Tools (Creator Toolbox)"}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOOLS.map((tool) => (
              <div
                key={tool.id}
                onClick={() => setActiveTool(tool.id as any)}
                className="group relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-4">
                  {/* Card Top: Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-3xl select-none">{tool.icon}</span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wider uppercase ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>
                  
                  {/* Card Middle: Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-rose-500 dark:group-hover:text-rose-450 transition-colors">
                      {lang === "ko" ? tool.title : tool.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                      {lang === "ko" ? tool.desc : tool.descEn}
                    </p>
                  </div>
                </div>
                
                {/* Card Bottom: Button */}
                <div className="mt-6 flex justify-end">
                  <button className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-rose-500 dark:group-hover:text-rose-450 transition-colors cursor-pointer">
                    {lang === "ko" ? "도구 실행하기" : "Launch Tool"}
                    <span className="text-base group-hover:translate-x-1 transition-transform">➔</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tool Modals */}
        <ToolModal
          isOpen={activeTool !== null}
          onClose={() => setActiveTool(null)}
          title={
            activeTool === "hashtag"
              ? (lang === "ko" ? "실시간 해시태그 트렌드 분석기" : "Real-time Hashtag Trend Analyzer")
              : activeTool === "translator"
              ? (lang === "ko" ? "다국어 숏폼 제목 번역" : "Global Title Translator")
              : activeTool === "revenue"
              ? (lang === "ko" ? "숏폼 예상 수익 시뮬레이터" : "Revenue Simulator")
              : activeTool === "safe-zone"
              ? (lang === "ko" ? "숏폼 안전 영역(Safe Zone) 프리뷰어" : "Short-form Safe Zone Previewer")
              : activeTool === "bpm-calculator"
              ? (lang === "ko" ? "숏폼 BGM 컷편집 계산기 (BPM Tapper)" : "BGM Beat-Sync Editor (BPM Tapper)")
              : activeTool === "shadowban-scanner"
              ? (lang === "ko" ? "틱톡/도우인 섀도우밴 위험 단어 스캐너" : "TikTok/Douyin Shadowban Word Scanner")
              : activeTool === "hook-generator"
              ? (lang === "ko" ? "AI 3초 후킹 대본 생성기" : "AI 3-Second Hook Generator")
              : ""
          }
        >
          {activeTool === "hashtag" && <HashtagTrendAnalyzer />}
          {activeTool === "translator" && <GlobalTranslator />}
          {activeTool === "revenue" && <RevenueSimulator />}
          {activeTool === "safe-zone" && <SafeZonePreviewer lang={lang} />}
          {activeTool === "bpm-calculator" && <BPMCalculator lang={lang} />}
          {activeTool === "shadowban-scanner" && <ShadowbanScanner lang={lang} />}
          {activeTool === "hook-generator" && <HookGenerator lang={lang} />}
        </ToolModal>

        <FAQSection 
          expandedFaqId={expandedFaqId} 
          setExpandedFaqId={setExpandedFaqId} 
        />

        {/* 애드센스 승인용 SEO 텍스트 블록 */}
        <section id="seo-guide-block" className="max-w-4xl mx-auto mt-16 pb-8 border-t border-zinc-900 pt-10 text-zinc-500">
          <h3 className="text-sm font-bold text-zinc-400 mb-4 tracking-wider uppercase">
            {lang === "ko" ? "💡 글로벌 크리에이터를 위한 숏폼 트렌드 분석 및 워터마크 제거 가이드" : "💡 Short-Form Trend Analysis & Watermark Removal Guide for Global Creators"}
          </h3>
          <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
            {lang === "ko" ? (
              <>
                <p>
                  오늘날 디지털 마케팅 환경에서 숏폼(Short-form) 콘텐츠는 단순한 엔터테인먼트를 넘어 브랜드 인지도와 전환율을 결정짓는 핵심 수단으로 자리 잡았습니다. 틱톡(TikTok)을 필두로 인스타그램 릴스(Instagram Reels), 유튜브 쇼츠(YouTube Shorts)는 글로벌 플랫폼 시장을 지배하고 있으며, 중국의 도우인(Douyin)과 샤오홍슈(Xiaohongshu)는 최첨단 트렌드와 이커머스 비즈니스 모델이 탄생하는 산실 역할을 하고 있습니다. 국내외 크리에이터와 마케터들이 글로벌 시장에서 선도적인 위치를 확보하기 위해서는 이러한 글로벌 플랫폼들의 콘텐츠 구성 방식, 시각적 연출, 그리고 유저 반응 요소를 철저하게 벤치마킹하는 것이 필수적입니다. 글로벌 트렌드를 면밀히 모니터링하고 가치를 추출해 내는 역량이 크리에이터 성장의 핵심 척도가 됩니다.
                </p>
                <p>
                  트렌드를 정밀하게 분석하기 위해서는 고화질 원본 비디오를 확보하는 것이 선행되어야 합니다. 워터마크가 포함된 영상은 시각적인 왜곡을 유발하며 인공지능 기반의 영상 분석 모델이나 비전 API가 프레임을 분석할 때 노이즈로 작용하여 정확도를 떨어뜨립니다. 워터마크가 완전히 배제된 초고화질(HD) 비디오는 크리에이터가 영상의 미장센, 트랜지션 기법, 자막 위치 및 컷 편집의 호흡을 프레임 단위로 완벽하게 뜯어보고 분석할 수 있는 환경을 선사합니다. 무손실 오리지널 미디어를 직접 분석함으로써, 해외 바이럴 영상이 유저들의 시선을 사로잡는 시각적인 패턴과 구성 방식을 온전하게 학습할 수 있습니다.
                </p>
                <p>
                  또한, 기술적 분석 수준을 넘어 마케팅 성과로 연결하기 위해서는 AI 기반의 자동화 도구들을 적극적으로 융합해야 합니다. ShortsPack Pro가 제공하는 Gemini AI 기반의 대본 추출 및 요약 기능은 영상의 음성 트랙을 고정밀 텍스트로 실시간 변환해 줍니다. 이를 통해 해외 인기 영상의 스크립트 흐름과 메시지 전달 방식을 텍스트 데이터로 치환하여 한눈에 파악할 수 있습니다. 더불어 다국어 번역과 AI 바이럴 피드백 툴은 단순히 한국어 타이틀을 직역하는 수준을 넘어, 대상 국가의 문화적 맥락과 트렌드를 결합한 '현지인 감성의 제목'으로 재구성해 줍니다. 이는 글로벌 오디언스의 노출을 유도하고 피드 클릭률(CTR)을 드라마틱하게 극대화하는 강력한 마케팅 무기가 됩니다.
                </p>
                <p>
                  마지막으로 크리에이터로서의 지속 가능성을 담보하고 비즈니스 모델을 견고히 다지기 위해서는 실시간 데이터 시뮬레이션이 수반되어야 합니다. 조회수와 채널 카테고리에 따른 예상 수익 및 브랜드 협찬(PPL) 단가를 과학적으로 시뮬레이션함으로써, 채널의 현재 가치와 잠재적 현금 흐름을 직관적으로 평가할 수 있습니다. 이는 크리에이터가 채널 운영 방향성을 설정하고 브랜디드 콘텐츠 계약 시 합리적인 단가 가이드를 마련하여 정당한 가치를 평가받도록 돕습니다. ShortsPack Pro의 초경량 숏폼 분석 시뮬레이터와 크리에이터 툴박스는 단순한 도구를 넘어, 전 세계 크리에이터들이 글로벌 시장에서 경쟁력을 갖고 독립적인 비즈니스 주체로 성장할 수 있도록 돕는 디지털 마케팅 허브의 역할을 할 것입니다.
                </p>
              </>
            ) : (
              <>
                <p>
                  In today's digital marketing landscape, short-form content has become a core mechanism for determining brand awareness and conversion rates, transcending simple entertainment. Led by TikTok, Instagram Reels, and YouTube Shorts dominate the global platform market, while China's Douyin and Xiaohongshu serve as cradles for cutting-edge trends and e-commerce business models. For creators and marketers to secure a leading position globally, it is essential to thoroughly benchmark these global platforms' content structure, visual presentation, and user reaction triggers. Monitoring and extracting value from global trends has become a primary metric for creator growth.
                </p>
                <p>
                  To precisely analyze trends, obtaining high-definition original videos must come first. Videos containing watermarks cause visual distortion and act as noise when AI-based video analysis models or vision APIs analyze frames, reducing accuracy. High-definition (HD) videos completely free of watermarks allow creators to perfectly dismantle and analyze video elements, transition techniques, caption placement, and cut editing pacing frame by frame. Analyzing lossless original media allows creators to learn visual patterns and storytelling structure that captivate global audiences.
                </p>
                <p>
                  Moreover, transitioning technical analysis into marketing outcomes requires active integration of AI-powered automation tools. The Gemini AI-based script extraction and summarization features provided by ShortsPack Pro convert audio tracks into high-precision text in real-time. This helps capture script flows and message delivery methods of popular overseas videos. Additionally, multilingual title translation and AI feedback tools go beyond simple literal translations, reconstructing Korean titles into "native-vibe viral titles" that reflect cultural contexts and localized trends. This serves as a powerful marketing weapon for boosting search exposure and click-through rates (CTR).
                </p>
                <p>
                  Finally, sustaining long-term viability as a creator and building a robust business model requires real-time data simulations. Scientifically simulating expected views and sponsorship (PPL) rates based on channel categories allows creators to intuitively evaluate their current market value and potential cash flows. This guides creators in setting channel directions and preparing reasonable pricing guidelines for branded content contracts. ShortsPack Pro's ultra-lightweight short-form simulator and creator toolbox serve as a digital marketing hub, empowering global creators to gain competitive advantages and grow as independent business entities.
                </p>
              </>
            )}
          </div>
        </section>

      </main>

      <Footer />

      {/* Toast Overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-zinc-700/50 text-sm font-medium flex items-center gap-2"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

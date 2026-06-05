"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MOCK_VIDEOS } from "@/data";
import { VideoMock, DownloadHistory as DownloadHistoryType } from "@/types";

import Header from "@/components/layout/Header";
import AdBanner from "@/components/layout/AdBanner";
import Footer from "@/components/layout/Footer";

import CPABanner from "@/components/CPABanner";
import { CPA_ADS } from "@/data/ads";
import HeroSection from "@/components/home/HeroSection";
import DownloaderCore from "@/components/home/DownloaderCore";
import DownloadResult from "@/components/home/DownloadResult";
import FeaturesGuide from "@/components/home/FeaturesGuide";
import DownloadHistory from "@/components/home/DownloadHistory";
import FAQSection from "@/components/home/FAQSection";

import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, limit, deleteDoc, doc } from "firebase/firestore";

export default function Home() {
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
      setErrorMessage(lang === "ko" ? "올바른 샤오홍수 링크가 아닙니다." : "Not a valid Xiaohongshu link.");
      showToast(lang === "ko" ? "올바른 샤오홍수 링크가 아닙니다." : "Not a valid Xiaohongshu link.");
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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#060609] text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-white">
      
      {/* Absolute Atmospheric Lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <Header lang={lang} setLang={setLang} />

      <main id="app-main" className="flex-grow max-w-6xl w-full mx-auto px-4 py-6 md:py-10 z-10">
        <AdBanner position="top" />

        <HeroSection lang={lang} />

        <div className="mb-6 w-full max-w-4xl mx-auto">
          <CPABanner ad={CPA_ADS.main_cpa} type="horizontal" />
        </div>

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

        <AdBanner position="bottom" />

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

        <FAQSection 
          expandedFaqId={expandedFaqId} 
          setExpandedFaqId={setExpandedFaqId} 
        />

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

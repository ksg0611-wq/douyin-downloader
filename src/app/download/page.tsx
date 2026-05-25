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

export default function Home() {
  const [url, setUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<VideoMock | null>(null);

  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadCompleted, setDownloadCompleted] = useState(false);
  const [downloadType, setDownloadType] = useState<"video" | "audio" | null>(null);

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
    const cached = localStorage.getItem("douyin_download_history");
    if (cached) {
      try {
        setHistoryList(JSON.parse(cached));
      } catch (e) {
        // Safe bypass
      }
    }
  }, []);

  const saveToHistory = (video: VideoMock) => {
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
      })
    };

    const updated = [newItem, ...historyList.filter(item => item.url !== video.url)].slice(0, 10);
    setHistoryList(updated);
    localStorage.setItem("douyin_download_history", JSON.stringify(updated));
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = historyList.filter(item => item.id !== id);
    setHistoryList(updated);
    localStorage.setItem("douyin_download_history", JSON.stringify(updated));
    showToast("기록이 삭제되었습니다.");
  };

  const clearAllHistory = () => {
    setHistoryList([]);
    localStorage.removeItem("douyin_download_history");
    showToast("모든 다운로드 기록이 삭제되었습니다.");
  };

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setErrorMessage("Douyin 비디오 주소를 정확히 입력해 주세요.");
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
        body: JSON.stringify({ url })
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
      showToast(data.warning || "Douyin 분석 완료!");
      
    } catch (err: any) {
      clearInterval(interval);
      setErrorMessage(err.message);
      showToast("분석에 실패했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickDemo = (demoUrl: string) => {
    setUrl(demoUrl);
    setErrorMessage("");
    showToast("데모 주소가 입력되었습니다. '다운로드'를 클릭하세요!");
  };

  const triggerDownloadAction = (type: "video" | "audio") => {
    if (!analysisResult) return;
    
    const targetUrl = type === "video" ? analysisResult.realVideoUrl : analysisResult.realAudioUrl;
    
    if (!targetUrl) {
       showToast("다운로드할 수 있는 원본 미디어 링크가 없습니다.");
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
       showToast(type === "video" ? "MP4 비디오 저장 시작!" : "오디오 트랙 추출 시작!");
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

      <Header />

      <main id="app-main" className="flex-grow max-w-6xl w-full mx-auto px-4 py-6 md:py-10 z-10">
        <AdBanner position="top" />

        <HeroSection />

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
            />
          )}
        </AnimatePresence>

        <FeaturesGuide />

        <DownloadHistory 
          historyList={historyList} 
          clearAllHistory={clearAllHistory} 
          deleteHistoryItem={deleteHistoryItem} 
          handleHistoryClick={(historyUrl) => {
            setUrl(historyUrl);
            window.scrollTo({ top: 120, behavior: "smooth" });
            showToast("주소가 붙여 넣어졌습니다. 다운로드 버튼을 클릭하세요!");
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

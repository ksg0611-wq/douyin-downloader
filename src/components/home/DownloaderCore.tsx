import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link as LinkIcon, X, Clipboard, Download, RefreshCcw, AlertCircle, Flame, Sparkles, CheckCircle2 } from "lucide-react";
import { MOCK_VIDEOS } from "../../data";

interface DownloaderCoreProps {
  url: string;
  setUrl: (val: string) => void;
  errorMessage: string;
  setErrorMessage: (val: string) => void;
  isAnalyzing: boolean;
  handleAnalyze: () => void;
  handlePaste: () => void;
  handleQuickDemo: (url: string) => void;
  analysisStep: number;
  platform: "douyin" | "xiaohongshu";
  setPlatform: (val: "douyin" | "xiaohongshu") => void;
  lang?: "ko" | "en";
}

const stepsText = [
  "접속 포트 분석기 초기화 및 패킷 스니핑 중...",
  "Douyin 비디오 서명 서명 알고리즘 해제 및 암호화 우회 중...",
  "1080p 고화질 무손실 데이터 스트림 파이프라인 생성 중...",
  "오리지널 비디오 캐시 메모리에서 워터마크 태그 완전 분리 완료!"
];

export default function DownloaderCore({
  url,
  setUrl,
  errorMessage,
  setErrorMessage,
  isAnalyzing,
  handleAnalyze,
  handlePaste,
  handleQuickDemo,
  analysisStep,
  platform,
  setPlatform,
  lang = "ko"
}: DownloaderCoreProps) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    // 0에서 3420까지 1초간 부드럽게 상승하는 CountUp 효과
    const target = 3420;
    const duration = 1000; // 1초
    const stepTime = 15;
    const steps = duration / stepTime;
    const increment = Math.ceil(target / steps);
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, stepTime);

    // 3~7초 간격으로 +1 또는 +2씩 실시간으로 추가되는 타이머 (라이브 시뮬레이션)
    let dynamicTimer: NodeJS.Timeout;
    const scheduleNextAddition = () => {
      const delay = Math.floor(Math.random() * 4000) + 3000;
      dynamicTimer = setTimeout(() => {
        const addition = Math.random() > 0.5 ? 2 : 1;
        setCount((prev) => prev + addition);
        scheduleNextAddition();
      }, delay);
    };

    setTimeout(() => {
      scheduleNextAddition();
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(dynamicTimer);
    };
  }, []);

  return (
    <section id="downloader-core" className="max-w-4xl mx-auto">
      <div className="bg-white/80 border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-900 backdrop-blur-xl rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl dark:shadow-3xl dark:shadow-black relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f2fe]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#fe0979]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          {/* Platform Selection Tab */}
          <div className="flex gap-2.5 mb-5 p-1 bg-zinc-100 border border-zinc-200/80 dark:bg-zinc-900/60 dark:border-zinc-800/80 rounded-xl max-w-sm">
            <button
              onClick={() => {
                setPlatform("douyin");
                setErrorMessage("");
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                platform === "douyin"
                  ? "bg-gradient-to-r from-[#00f2fe]/25 to-[#fe0979]/25 border border-rose-500/30 text-zinc-800 dark:text-white shadow-md shadow-[#fe0979]/10"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              {lang === "ko" ? "도우인 (Douyin)" : "Douyin"}
            </button>
            <button
              onClick={() => {
                setPlatform("xiaohongshu");
                setErrorMessage("");
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                platform === "xiaohongshu"
                  ? "bg-gradient-to-r from-[#fe0979]/25 to-[#00f2fe]/25 border border-cyan-500/30 text-zinc-800 dark:text-white shadow-md shadow-[#00f2fe]/10"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {lang === "ko" ? "샤오홍슈 (Xiaohongshu)" : "Xiaohongshu"}
            </button>
          </div>

          {/* 실시간 라이브 트래픽 카운터 배너 */}
          <div className="mb-5 p-3 rounded-xl bg-zinc-100 border border-zinc-200 dark:bg-zinc-900/30 dark:border-zinc-900/60 flex items-center justify-center gap-2 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-pulse" />
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <p className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 tracking-wide">
              {lang === "ko" ? (
                <>
                  🔥 오늘 전 세계 크리에이터가 다운로드한 영상:{" "}
                  <span className="font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-rose-400">
                    {count.toLocaleString()}
                  </span>
                  개
                </>
              ) : (
                <>
                  🔥 Total videos downloaded by creators worldwide today:{" "}
                  <span className="font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-rose-400">
                    {count.toLocaleString()}
                  </span>
                </>
              )}
            </p>
          </div>

          <label htmlFor="url-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-400 mb-2 px-1 flex items-center justify-between">
            <span>
              {lang === "ko" 
                ? (platform === "douyin" ? "Douyin 동영상 링크 주소 입력하기" : "Xiaohongshu 동영상/이미지 링크 주소 입력하기")
                : (platform === "douyin" ? "Enter Douyin Video Link" : "Enter Xiaohongshu Video/Image Link")}
            </span>
            <span className="text-[10px] text-zinc-600 dark:text-zinc-500 font-normal normal-case">
              {lang === "ko" ? "사파리, 크롬 복사 링크 완벽 통합 지원" : "Fully supports Safari & Chrome copied links"}
            </span>
          </label>

          <div className="relative flex flex-col md:flex-row gap-3 items-stretch">
            <div className="relative flex-grow group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00f2fe] to-[#fe0979] rounded-xl opacity-20 group-focus-within:opacity-80 transition duration-300 blur-sm pointer-events-none" />
              
              <div className="relative flex items-center bg-white border border-zinc-250 dark:bg-zinc-900 dark:border-zinc-800 rounded-xl leading-none shadow-sm">
                <span className="pl-4 text-zinc-400 dark:text-zinc-500">
                  <LinkIcon className="w-5 h-5 text-zinc-400 dark:text-zinc-400 flex-shrink-0" />
                </span>
                
                <input
                  id="url-input"
                  type="text"
                  className="w-full bg-transparent text-zinc-800 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-500 text-sm md:text-base px-3 py-4 focus:outline-none min-w-0 font-sans"
                  placeholder={lang === "ko" ? "여기에 동영상 링크를 붙여넣으세요..." : "Paste the video link here..."}
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAnalyze();
                  }}
                />

                {url && (
                  <button
                    onClick={() => setUrl("")}
                    className="p-1 px-2.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title={lang === "ko" ? "입력값 지우기" : "Clear input"}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={handlePaste}
                  className="mr-2 flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-250 text-zinc-700 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 dark:border-zinc-700/60 dark:text-zinc-300 px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-all font-medium flex-shrink-0"
                  title={lang === "ko" ? "클립보드에서 자동 붙여넣기" : "Paste from clipboard"}
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{lang === "ko" ? "붙여넣기" : "Paste"}</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`relative overflow-hidden rounded-xl font-bold text-sm md:text-base px-8 py-3.5 flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer text-white shadow-xl ${
                isAnalyzing 
                  ? "bg-zinc-800 border border-zinc-700 text-zinc-500 pointer-events-none cursor-not-allowed scale-95" 
                  : "bg-gradient-to-r from-[#00f2fe] via-[#5c64ff] to-[#fe0979] hover:brightness-110 active:scale-95 hover:shadow-cyan-500/20"
              }`}
            >
              <span className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors pointer-events-none" />
              
              {isAnalyzing ? (
                <>
                  <RefreshCcw className="w-5 h-5 animate-spin text-zinc-400" />
                  <span>{lang === "ko" ? "추출 분석 중..." : "Analyzing..."}</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>{lang === "ko" ? "다운로드" : "Download"}</span>
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-red-400 text-xs font-medium mt-3 px-1"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 border-t border-zinc-200 dark:border-zinc-900 pt-4">
          <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-550 uppercase tracking-widest flex items-center gap-1.5 mb-2 px-1">
            <Flame className="w-3 text-rose-500 animate-bounce" />
            테스트용 Douyin 원클릭 샘플 링크 (직접 클릭해 하단에서 테스트 가능)
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {MOCK_VIDEOS.map((v, idx) => (
              <button
                key={v.id}
                onClick={() => handleQuickDemo(v.url)}
                className="text-left bg-white hover:bg-zinc-55 border border-zinc-200 dark:bg-zinc-900/60 dark:hover:bg-zinc-900 dark:border-zinc-800/80 dark:hover:border-zinc-700 p-2.5 rounded-lg text-xs leading-normal transition-all group flex items-start gap-2 max-w-full overflow-hidden shadow-sm dark:shadow-none"
              >
                <span className="w-5 h-5 rounded bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 text-[10px] font-bold flex items-center justify-center shrink-0 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 group-hover:text-[#00f2fe] transition-all">
                  {idx + 1}
                </span>
                <div className="truncate">
                  <div className="font-semibold text-zinc-750 group-hover:text-rose-600 dark:text-zinc-300 dark:group-hover:text-white truncate">
                    {v.creatorName}
                  </div>
                  <div className="text-[10px] text-zinc-550 dark:text-zinc-500 truncate mt-0.5">
                    {v.title}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 z-20 text-center"
            >
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-zinc-200 dark:border-zinc-800 border-t-cyan-400 border-r-rose-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
              </div>

              <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 via-purple-500 to-rose-500 dark:from-cyan-400 dark:to-rose-400 bg-clip-text text-transparent mb-1">
                인증 헤더 우회 분석 중
              </h3>
              <p className="text-xs text-zinc-650 dark:text-zinc-400 mb-6 max-w-xs">
                Douyin 시스템은 보안 쿠키 서신을 포함합니다. 수 밀리초 내에 AI 우회가 진행됩니다.
              </p>

              <div className="w-full max-w-sm bg-zinc-50 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-lg p-3.5 text-left font-mono text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 space-y-2.5">
                {stepsText.map((txt, index) => {
                  const isDone = index < analysisStep;
                  const isActive = index === analysisStep;
                  return (
                    <div 
                      key={index} 
                      className={`flex items-start gap-2.5 transition-all duration-300 ${
                        isDone ? "text-cyan-400" : isActive ? "text-rose-400 font-semibold" : "text-zinc-600"
                      }`}
                    >
                      <span className="shrink-0 mt-0.5">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        ) : isActive ? (
                          <RefreshCcw className="w-4 h-4 animate-spin text-rose-400 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 bg-zinc-950" />
                        )}
                      </span>
                      <span className="flex-grow">{txt}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}

import React from "react";
import { History, Trash2, X, ArrowRight } from "lucide-react";
import { DownloadHistory as DownloadHistoryType } from "../../types";

interface DownloadHistoryProps {
  historyList: DownloadHistoryType[];
  clearAllHistory: () => void;
  deleteHistoryItem: (id: string, e: React.MouseEvent) => void;
  handleHistoryClick: (item: DownloadHistoryType) => void;
}

export default function DownloadHistory({
  historyList,
  clearAllHistory,
  deleteHistoryItem,
  handleHistoryClick
}: DownloadHistoryProps) {
  // 최대 5개까지만 최신순 노출
  const displayList = historyList.slice(0, 5);

  return (
    <section id="download-history-section" className="my-8 max-w-4xl mx-auto">
      <div className="bg-white border border-zinc-200 dark:bg-zinc-950/40 dark:border-zinc-900/80 rounded-2xl p-5 shadow-xl relative overflow-hidden backdrop-blur-sm">
        
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-900 pb-3 relative z-10">
          <h3 className="text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            🕒 최근 다운로드 기록
          </h3>
          {historyList.length > 0 && (
            <button
              onClick={clearAllHistory}
              className="text-[10px] text-zinc-500 hover:text-rose-500 dark:text-zinc-500 dark:hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              전체 지우기
            </button>
          )}
        </div>

        {displayList.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-500 dark:text-zinc-600 font-medium">
            아직 분석한 비디오 기록이 없습니다. 상단에서 비디오 주소를 입력하고 간편하게 다운로드해보세요.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-10">
            {displayList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleHistoryClick(item)}
                className="p-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-250 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/70 dark:border-zinc-900 dark:hover:border-zinc-800 rounded-xl flex items-center gap-3 cursor-pointer group transition-all animate-fade-in"
              >
                {/* 썸네일 미니 미리보기 */}
                <div className="relative w-11 h-14 rounded overflow-hidden shrink-0 bg-black border border-zinc-200 dark:border-zinc-850">
                  <img 
                    src={item.thumbnail} 
                    alt="Thumbnail preview" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                {/* 영상 정보 (말줄임표 처리 포함) */}
                <div className="min-w-0 flex-grow">
                  <div className="text-[10px] font-bold text-zinc-500 flex items-center justify-between">
                    <span>{item.creatorName}</span>
                    <span>{item.downloadedAt}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-zinc-805 dark:text-zinc-300 truncate mt-0.5 group-hover:text-cyan-600 dark:group-hover:text-[#00f2fe] transition-colors">
                    {item.title}
                  </h4>
                  <div className="text-[9px] text-zinc-500 truncate mt-0.5">
                    {item.url}
                  </div>
                </div>

                {/* 제어 버튼 */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHistoryClick(item);
                    }}
                    className="p-1 px-2 text-[10px] font-bold bg-white hover:bg-cyan-500 hover:text-white text-cyan-650 border border-cyan-200 hover:border-cyan-500 dark:bg-zinc-950/80 dark:hover:bg-cyan-500 dark:hover:text-zinc-950 dark:text-cyan-400 dark:border-cyan-500/30 dark:hover:border-cyan-400 rounded-lg transition-all flex items-center gap-0.5 cursor-pointer"
                    title="분석 결과로 이동"
                  >
                    <span>바로보기</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={(e) => deleteHistoryItem(item.id, e)}
                    className="p-1.5 text-zinc-500 hover:text-rose-650 hover:bg-rose-50 dark:text-zinc-700 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                    title="이력에서 지우기"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

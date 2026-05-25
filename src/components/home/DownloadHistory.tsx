import React from "react";
import { History, Trash2, X } from "lucide-react";
import { DownloadHistory as DownloadHistoryType } from "../../types";

interface DownloadHistoryProps {
  historyList: DownloadHistoryType[];
  clearAllHistory: () => void;
  deleteHistoryItem: (id: string, e: React.MouseEvent) => void;
  handleHistoryClick: (url: string) => void;
}

export default function DownloadHistory({
  historyList,
  clearAllHistory,
  deleteHistoryItem,
  handleHistoryClick
}: DownloadHistoryProps) {
  return (
    <section id="download-history-section" className="my-8 max-w-4xl mx-auto">
      <div className="bg-zinc-950/40 border border-zinc-900/80 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-900 pb-3">
          <h3 className="text-xs sm:text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            최근 분석 다운로드 보관함
          </h3>
          {historyList.length > 0 && (
            <button
              onClick={clearAllHistory}
              className="text-[10px] text-zinc-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer font-bold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              전체 지우기
            </button>
          )}
        </div>

        {historyList.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-600 font-medium">
            아직 분석한 비디오 기록이 없습니다. 상단에서 비디오 주소를 입력하고 간편하게 다운로드해보세요.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {historyList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleHistoryClick(item.url)}
                className="p-3 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800/60 rounded-xl flex items-center gap-3 cursor-pointer group transition-all"
              >
                <div className="relative w-12 h-16 rounded overflow-hidden shrink-0 bg-black border border-zinc-800">
                  <img 
                    src={item.thumbnail} 
                    alt="Thumbnail preview" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                  />
                </div>
                <div className="min-w-0 flex-grow">
                  <div className="text-[10px] font-bold text-zinc-500 flex items-center justify-between">
                    <span>{item.creatorName}</span>
                    <span>{item.downloadedAt}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-zinc-200 truncate mt-0.5 group-hover:text-[#00f2fe] transition-colors">
                    {item.title}
                  </h4>
                  <div className="text-[10px] text-zinc-500 truncate mt-1">
                    {item.url}
                  </div>
                </div>
                <button
                  onClick={(e) => deleteHistoryItem(item.id, e)}
                  className="p-1 text-zinc-700 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all shrink-0"
                  title="이력에서 지우기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { DollarSign, X, TrendingUp, BarChart3 } from "lucide-react";

interface AdSimulatorWidgetProps {
  showSimulator: boolean;
  setShowSimulator: (val: boolean) => void;
  downloadSessionCount: number;
  userCpm: number;
  setUserCpm: (val: number) => void;
  dailyTraffic: number;
  setDailyTraffic: (val: number) => void;
  activeBannerCount: number;
  setActiveBannerCount: (val: number) => void;
}

export default function AdSimulatorWidget({
  showSimulator,
  setShowSimulator,
  downloadSessionCount,
  userCpm,
  setUserCpm,
  dailyTraffic,
  setDailyTraffic,
  activeBannerCount,
  setActiveBannerCount
}: AdSimulatorWidgetProps) {
  
  const monthlyRevenueEst = ((dailyTraffic * activeBannerCount * 30 * (userCpm / 1000))).toFixed(2);
  const clickRateEst = (dailyTraffic * 0.035 * activeBannerCount).toFixed(0);

  return (
    <AnimatePresence>
      {showSimulator && (
        <motion.aside 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          id="ad-simulator-panel"
          className="fixed bottom-3 right-3 z-40 w-full max-w-xs bg-zinc-950/95 border border-yellow-500/30 rounded-2xl p-4.5 shadow-2xl backdrop-blur-xl shrink-0 group"
        >
          <div className="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-yellow-400">
              <DollarSign className="w-4 h-4 text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
              Ad Monetization Lab (SaaS)
            </span>
            <button 
              onClick={() => setShowSimulator(false)}
              className="text-zinc-600 hover:text-zinc-300 transition-colors p-0.5"
              title="시뮬레이터창 끄기"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            <p className="text-[10px] text-zinc-400 leading-normal">
              본 웹사이트에 탑재된 배너 슬롯 <strong>(상단 #{activeBannerCount === 3 ? "3개" : "2개"})</strong>의 가상 구글 애드센스 단가 및 CPA 수익률을 시뮬레이션 해 보십시오!
            </p>

            <div className="grid grid-cols-2 gap-2 bg-zinc-900 rounded-lg p-2 font-mono text-center">
              <div className="border-r border-zinc-800">
                <span className="text-[9px] text-zinc-500 block">오늘 백업 수</span>
                <span className="text-white font-bold text-xs">{downloadSessionCount} 회</span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 block">오늘 예상 수익</span>
                <span className="text-yellow-400 font-bold text-xs">${(downloadSessionCount * (userCpm / 1000)).toFixed(3)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>일일 방문자 수 (DAU)</span>
                <span className="font-mono text-white">{dailyTraffic.toLocaleString()}명</span>
              </div>
              <input 
                type="range" 
                min="100" max="100000" step="100" 
                value={dailyTraffic}
                onChange={(e) => setDailyTraffic(Number(e.target.value))}
                className="w-full accent-yellow-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>평균 CPM 단가 (USD)</span>
                <span className="font-mono text-white">${userCpm.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0.5" max="15" step="0.5" 
                value={userCpm}
                onChange={(e) => setUserCpm(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                <TrendingUp className="w-3.5 h-3.5" />
                월간 예상 수익 (30일 기준)
              </div>
              <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1">
                <span className="text-zinc-500 text-sm">$</span>
                {Number(monthlyRevenueEst).toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[9px] text-zinc-500">
                <BarChart3 className="w-3 h-3" />
                예상 월간 클릭수: {Number(clickRateEst).toLocaleString()}회 (CTR 3.5%)
              </div>
            </div>

          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

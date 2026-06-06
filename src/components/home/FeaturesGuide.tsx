import React from "react";
import { Smartphone, Link as LinkIcon, Download } from "lucide-react";

export default function FeaturesGuide() {
  return (
    <section id="features-guide" className="my-5 md:my-6 max-w-4xl mx-auto">
      <div className="text-center mb-5">
        <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
          Douyin 비디오 저장하는 법 (초간단 3초 가이드)
        </h3>
        <p className="text-[11px] text-zinc-555 dark:text-zinc-500 mt-0.5">
          앱 설치나 가입 없이 동영상의 링크 주소 하나만으로 워터마크가 완벽히 없는 MP4 원본 저장이 가능합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 dark:bg-zinc-950/40 dark:border-zinc-900/80 rounded-xl p-3.5 relative overflow-hidden shadow-sm">
          <div className="text-xl font-black bg-gradient-to-r from-[#fe0979] to-purple-500 bg-clip-text text-transparent mb-1 font-mono">
            01
          </div>
          <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-xs mb-1 flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-[#fe0979]" />
            Douyin에서 주소 복사
          </h4>
          <p className="text-[11px] text-zinc-650 dark:text-zinc-400 leading-normal">
            Douyin 앱 또는 웹 사이트에서 마음에 드는 비디오를 탐색하고, 우하단의 <strong>[공유](分享) → [링크 복사](复制链接)</strong> 단추를 눌러 클립보드에 복사해 주세요.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 dark:bg-zinc-950/40 dark:border-zinc-900/80 rounded-xl p-3.5 relative overflow-hidden shadow-sm">
          <div className="text-xl font-black bg-gradient-to-r from-purple-500 to-[#00f2fe] bg-clip-text text-transparent mb-1 font-mono">
            02
          </div>
          <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-xs mb-1 flex items-center gap-1">
            <LinkIcon className="w-3.5 h-3.5 text-[#00f2fe]" />
            주소 입력 및 분석 시작
          </h4>
          <p className="text-[11px] text-zinc-650 dark:text-zinc-400 leading-normal">
            복사한 주소를 본 사이트 주소창에 넣은 다음, <strong>[워터마크 제거 & 다운로드]</strong> 파란 버튼을 클릭하십시오. 인공지능이 약 2초간 보안 분석을 수행합니다.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 dark:bg-zinc-950/40 dark:border-zinc-900/80 rounded-xl p-3.5 relative overflow-hidden shadow-sm">
          <div className="text-xl font-black bg-gradient-to-r from-[#00f2fe] to-emerald-400 bg-clip-text text-transparent mb-1 font-mono">
            03
          </div>
          <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-xs mb-1 flex items-center gap-1">
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            워터마크 제어 MP4 다운로드
          </h4>
          <p className="text-[11px] text-zinc-650 dark:text-zinc-400 leading-normal">
            우회 분석이 종료되면 비디오 정보 카드와 함께 파일 사이즈가 표시됩니다. <strong>[MP4 다운로드]</strong>를 클릭해 최고화질(HD) 파일로 저장하십시오.
          </p>
        </div>
      </div>
    </section>
  );
}

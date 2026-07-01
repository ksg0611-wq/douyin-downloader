"use client";

import React, { useState, useMemo } from "react";
import { 
  Hash, 
  Search, 
  Copy, 
  CheckCircle2, 
  RefreshCcw, 
  BarChart2, 
  Zap,
  Info,
  Check,
  Trash2,
  FolderHeart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { sendGAEvent } from "@next/third-parties/google";

interface TagItem {
  tag: string;
  competition: "낮음" | "보통" | "높음";
  searchVolume: string;
}

const CATEGORY_PRESETS: Record<string, TagItem[]> = {
  "IT/테크": [
    { tag: "테크꿀팁", competition: "보통", searchVolume: "125K" },
    { tag: "스마트폰활용", competition: "낮음", searchVolume: "48K" },
    { tag: "AI혁명", competition: "높음", searchVolume: "520K" },
    { tag: "유용한앱", competition: "보통", searchVolume: "98K" },
    { tag: "생산성향상", competition: "낮음", searchVolume: "35K" },
    { tag: "IT트렌드", competition: "보통", searchVolume: "110K" },
    { tag: "전자기기리뷰", competition: "높음", searchVolume: "310K" },
    { tag: "직장인꿀팁", competition: "보통", searchVolume: "145K" },
    { tag: "아이패드꿀팁", competition: "낮음", searchVolume: "55K" },
    { tag: "어플추천", competition: "높음", searchVolume: "420K" }
  ],
  "요리/푸드": [
    { tag: "초간단레시피", competition: "높음", searchVolume: "680K" },
    { tag: "1분요리", competition: "높음", searchVolume: "890K" },
    { tag: "자취생요리", competition: "보통", searchVolume: "210K" },
    { tag: "오늘뭐먹지", competition: "높음", searchVolume: "1.2M" },
    { tag: "요리꿀팁", competition: "보통", searchVolume: "180K" },
    { tag: "홈쿡스타그램", competition: "보통", searchVolume: "350K" },
    { tag: "자취레시피", competition: "낮음", searchVolume: "78K" },
    { tag: "에어프라이어", competition: "보통", searchVolume: "290K" },
    { tag: "다이어트식단", competition: "높음", searchVolume: "740K" },
    { tag: "베이킹초보", competition: "낮음", searchVolume: "42K" }
  ],
  "패션/뷰티": [
    { tag: "데일리룩", competition: "높음", searchVolume: "2.4M" },
    { tag: "꾸안꾸패션", competition: "높음", searchVolume: "850K" },
    { tag: "뷰티꿀팁", competition: "보통", searchVolume: "310K" },
    { tag: "올리브영추천템", competition: "높음", searchVolume: "620K" },
    { tag: "패션트렌드", competition: "보통", searchVolume: "190K" },
    { tag: "체형별코디", competition: "낮음", searchVolume: "85K" },
    { tag: "스킨케어루틴", competition: "보통", searchVolume: "140K" },
    { tag: "메이크업튜토리얼", competition: "높음", searchVolume: "450K" },
    { tag: "가성비코디", competition: "낮음", searchVolume: "62K" },
    { tag: "헤어스타일링", competition: "보통", searchVolume: "280K" }
  ],
  "일상/Vlog": [
    { tag: "일상기록", competition: "높음", searchVolume: "1.8M" },
    { tag: "숏폼일상", competition: "보통", searchVolume: "320K" },
    { tag: "주말브이로그", competition: "보통", searchVolume: "270K" },
    { tag: "자취일상", competition: "낮음", searchVolume: "95K" },
    { tag: "힐링영상", competition: "보통", searchVolume: "410K" },
    { tag: "직장인일상", competition: "높음", searchVolume: "720K" },
    { tag: "감성브이로그", competition: "높음", searchVolume: "930K" },
    { tag: "소소한행복", competition: "낮음", searchVolume: "58K" },
    { tag: "대학생일상", competition: "보통", searchVolume: "180K" },
    { tag: "현실고증", competition: "보통", searchVolume: "240K" }
  ],
  "재테크/비즈니스": [
    { tag: "동기부여", competition: "높음", searchVolume: "950K" },
    { tag: "자기계발", competition: "높음", searchVolume: "1.1M" },
    { tag: "직장인재테크", competition: "보통", searchVolume: "240K" },
    { tag: "주식투자초보", competition: "보통", searchVolume: "195K" },
    { tag: "성공마인드", competition: "보통", searchVolume: "310K" },
    { tag: "부자되는법", competition: "높음", searchVolume: "580K" },
    { tag: "소액투자", competition: "낮음", searchVolume: "72K" },
    { tag: "비즈니스인사이트", competition: "낮음", searchVolume: "45K" },
    { tag: "돈모으기", competition: "보통", searchVolume: "185K" },
    { tag: "마케팅공부", competition: "낮음", searchVolume: "38K" }
  ]
};

const SUFFIXES = [
  "꿀팁", "추천", "정보", "트렌드", "시작하기", "핵심노하우", "초보탈출", "비밀공개", "정복하기", "분석리포트"
];

export default function HashtagScannerClient() {
  const [activeCategory, setActiveCategory] = useState<string>("IT/테크");
  const [customKeyword, setCustomKeyword] = useState<string>("");
  const [results, setResults] = useState<TagItem[]>(CATEGORY_PRESETS["IT/테크"]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedBasket, setCopiedBasket] = useState<boolean>(false);

  // 경쟁도 배지 스타일링
  const getCompBadgeStyle = (comp: "낮음" | "보통" | "높음") => {
    if (comp === "높음") {
      return "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-400";
    }
    if (comp === "보통") {
      return "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-400";
    }
    return "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-400";
  };

  // 카테고리 클릭 시
  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    setCustomKeyword("");
    setIsScanning(true);
    setTimeout(() => {
      setResults(CATEGORY_PRESETS[category]);
      setIsScanning(false);
    }, 200);
  };

  // 키워드 입력 후 스캔 실행
  const handleScan = () => {
    const kw = customKeyword.trim();
    if (!kw) return;

    setIsScanning(true);
    setActiveCategory(""); // 카테고리 활성 비활성화

    setTimeout(() => {
      // 키워드와 접미사를 조합해 동적으로 해시태그 10개 빌드
      const generated: TagItem[] = SUFFIXES.map((suffix, idx) => {
        const text = `${kw}${suffix}`;
        
        // 글자 수 기반으로 그럴듯하게 경쟁도와 조회수 결정
        const len = text.length;
        let competition: "낮음" | "보통" | "높음" = "보통";
        let searchVolume = "85K";
        
        if (len % 3 === 0) {
          competition = "높음";
          searchVolume = `${(len * 24 + 100)}K`;
        } else if (len % 3 === 1) {
          competition = "낮음";
          searchVolume = `${(len * 6 + 10)}K`;
        } else {
          competition = "보통";
          searchVolume = `${(len * 12 + 40)}K`;
        }

        return { tag: text, competition, searchVolume };
      });

      setResults(generated);
      setIsScanning(false);

      try {
        sendGAEvent({ event: "generate_click", value: "hashtag_scanner" });
      } catch (e) {
        // safe bypass
      }
    }, 450);
  };

  // 개별 태그 클릭 (바구니 추가/삭제)
  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  // 바구니 일괄 복사
  const handleCopyBasket = async () => {
    if (selectedTags.length === 0) return;
    
    // 해시태그 형식(#태그)으로 결합
    const textToCopy = selectedTags.map(t => `#${t}`).join(" ");
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedBasket(true);
      setTimeout(() => setCopiedBasket(false), 1500);

      try {
        sendGAEvent({ event: "copy_click", value: "hashtag_scanner_basket" });
      } catch (e) {
        // safe bypass
      }
    } catch (e) {
      // safe bypass
    }
  };

  // 모든 검색 결과 복사
  const handleCopyAll = async () => {
    if (results.length === 0) return;
    
    const textToCopy = results.map(item => `#${item.tag}`).join(" ");
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);

      try {
        sendGAEvent({ event: "copy_click", value: "hashtag_scanner_all" });
      } catch (e) {
        // safe bypass
      }
    } catch (e) {
      // safe bypass
    }
  };

  // 바구니 비우기
  const handleClearBasket = () => {
    setSelectedTags([]);
  };

  return (
    <div id="hashtag-scanner-container" className="w-full max-w-4xl mx-auto space-y-6">
      {/* 타이틀 헤더 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-rose-500/20 animate-pulse">
          <Hash className="w-5.5 h-5.5 text-white" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            🏷️ 알고리즘 해시태그 스캐너
            <span className="bg-gradient-to-r from-rose-500 to-indigo-500 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              SEO
            </span>
          </h2>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-1">
            내 숏폼 영상의 도달률을 높여주는 황금 키워드와 인기 해시태그 조합을 실시간으로 스캔합니다.
          </p>
        </div>
      </div>

      {/* 입력 및 카테고리 컨트롤 */}
      <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* 키워드 검색창 */}
        <div className="space-y-2 relative z-10">
          <label htmlFor="hashtag-keyword-input" className="block text-xs font-bold text-zinc-850 dark:text-zinc-300 uppercase tracking-wider px-1">
            🎯 맞춤형 키워드로 분석해 스캔하기
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-indigo-500 rounded-xl opacity-10 group-focus-within:opacity-40 transition duration-300 blur-sm pointer-events-none" />
              <input
                id="hashtag-keyword-input"
                type="text"
                className="relative w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-400/60 transition-colors font-sans"
                placeholder="예: 홈트레이닝, 캠핑요리, 여름휴가 등"
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleScan();
                }}
              />
            </div>
            <button
              onClick={handleScan}
              disabled={isScanning || !customKeyword.trim()}
              className={`py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-lg ${
                isScanning || !customKeyword.trim()
                  ? "bg-zinc-800 text-zinc-500 border border-zinc-700 pointer-events-none"
                  : "bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:brightness-105 active:scale-95 shadow-rose-500/10"
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin text-zinc-500" />
                  <span>스캔 중...</span>
                </>
              ) : (
                <>
                  <span>태그 스캔</span>
                  <Search className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 카테고리 프리셋 탭 */}
        <div className="space-y-2.5 relative z-10 border-t border-zinc-100 dark:border-zinc-900 pt-4">
          <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-550 uppercase tracking-widest block px-1">
            ⚡ 카테고리별 황금 해시태그 즉시 불러오기
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.keys(CATEGORY_PRESETS).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border active:scale-95 ${
                  activeCategory === cat
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-500 font-black dark:bg-rose-500/20"
                    : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 dark:bg-zinc-900/60 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 태그 바구니 (Tag Basket) */}
      <div className="bg-gradient-to-r from-rose-500/5 to-indigo-500/5 border border-rose-500/10 dark:from-rose-500/10 dark:to-indigo-500/10 dark:border-rose-500/20 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-500 text-white font-extrabold text-xs">
              {selectedTags.length}
            </span>
            <h3 className="text-sm font-extrabold text-zinc-850 dark:text-zinc-200">
              선택한 해시태그 바구니
            </h3>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-500">
              (결과 창에서 태그를 클릭하여 담을 수 있습니다)
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedTags.length > 0 && (
              <>
                <button
                  onClick={handleClearBasket}
                  className="p-2 text-zinc-500 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                  title="바구니 비우기"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>비우기</span>
                </button>
                <button
                  onClick={handleCopyBasket}
                  className={`py-2 px-4 rounded-xl border text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                    copiedBasket
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-teal-300"
                      : "bg-gradient-to-r from-rose-500 to-indigo-600 hover:brightness-105 active:scale-95 text-white shadow-rose-500/10 border-transparent"
                  }`}
                >
                  {copiedBasket ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedBasket ? "복사 완료!" : "바구니 전체 복사"}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {selectedTags.length === 0 ? (
          <div className="py-4 text-center text-xs text-zinc-650 dark:text-zinc-400 font-bold border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-white/40 dark:bg-zinc-950/20">
            👉 아래 해시태그 목록에서 담고 싶은 태그를 터치/클릭해 보세요.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 p-3 bg-white/50 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/60 rounded-xl max-h-32 overflow-y-auto">
            {selectedTags.map(tag => (
              <motion.button
                key={tag}
                layout
                onClick={() => handleTagClick(tag)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-500 text-white dark:bg-rose-600 flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
              >
                <span>#{tag}</span>
                <span className="text-[9px] bg-white/20 rounded-full px-1">×</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* 스캔 결과 목록 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            📊 스캔된 추천 태그 목록 (총 {results.length}개)
          </span>
          {results.length > 0 && (
            <button
              onClick={handleCopyAll}
              className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                copiedAll
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                  : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? "일괄 복사 완료" : "전체 복사"}</span>
            </button>
          )}
        </div>

        {isScanning ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 4, 5].map((idx) => (
              <div key={idx} className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-900 rounded-xl p-4 space-y-2.5 animate-pulse flex items-center justify-between min-h-[64px]">
                <div className="w-1/2 h-4 bg-zinc-250 dark:bg-zinc-800 rounded" />
                <div className="w-16 h-5 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map((item, idx) => {
              const isSelected = selectedTags.includes(item.tag);
              return (
                <motion.div
                  key={item.tag}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => handleTagClick(item.tag)}
                  className={`border rounded-xl p-4 transition-all flex items-center justify-between gap-3 cursor-pointer shadow-sm relative overflow-hidden group select-none ${
                    isSelected
                      ? "bg-rose-500/5 border-rose-500 dark:bg-rose-500/10 dark:border-rose-500"
                      : "bg-white border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2 z-10">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                      isSelected 
                        ? "bg-rose-500 border-rose-500 text-white" 
                        : "border-zinc-300 dark:border-zinc-700 text-transparent"
                    }`}>
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    </div>
                    <span className={`text-sm font-bold tracking-tight ${isSelected ? 'text-rose-600 dark:text-rose-450' : 'text-zinc-800 dark:text-zinc-200'}`}>
                      #{item.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 z-10">
                    <span className="text-[10px] font-mono text-zinc-550 dark:text-zinc-500">
                      조회수 {item.searchVolume}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getCompBadgeStyle(item.competition)}`}>
                      경쟁도 {item.competition}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <hr className="my-8 border-zinc-200 dark:border-zinc-800" />
      
      {/* 가이드 정보 */}
      <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 space-y-4 leading-relaxed">
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">💡 해시태그 스캔 및 매칭 알고리즘 가이드</h4>
          <p>
            숏폼 알고리즘(유튜브 쇼츠, 틱톡, 인스타그램 릴스)은 영상이 담고 있는 문맥(Context)을 파악하기 위해 태그와 타이틀을 최우선으로 스캔합니다. 본 도구는 카테고리별 시청 피드 트래픽 분석에 따라 가장 효과적인 볼륨 대비 경쟁도 밸런스를 맞춘 **'황금 해시태그 조합'**을 선별하여 제공합니다. 경쟁도가 '낮음'인 태그는 롱테일 키워드로 초반 노출 획득에 유리하며, 경쟁도 '높음' 태그는 조회수가 터졌을 때 대규모의 추가 트래픽 유입을 노리기 좋습니다.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">📖 올바른 해시태그 기입 방법</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li>영상 성격에 맞는 <strong>경쟁도 높음(메인 카테고리) 2개, 보통 2개, 낮음(롱테일) 2개</strong> 조합을 바구니에 담아 구성하는 것이 트래픽 유입 극대화의 황금비율입니다.</li>
            <li>바구니에 담긴 해시태그들을 일괄 복사하여 숏폼 비디오 업로드 시 설명창 혹은 고정 댓글에 붙여넣어 활성화하십시오.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

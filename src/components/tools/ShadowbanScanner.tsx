"use client";

import React, { useState, useMemo } from "react";
import { 
  ShieldAlert, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Sparkles,
  Info,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ShadowbanScannerProps {
  lang?: "ko" | "en";
}

// 섀도우밴 유발 위험 단어 사전 (플랫폼 노출 제한 가이드라인 준수)
const SHADOWBAN_WORDS = [
  "무조건", "100%", "완치", "최고의", "돈버는법", "돈 버는 법", 
  "수익보장", "수익 보장", "팔로워 늘리기", "다이어트 약", "다이어트약", 
  "비밀", "부업", "재택알바", "수익인증", "수익 인증", "최저가", 
  "공짜", "무료증정", "무료 증정", "부자되는", "부자 되는", "즉시 효과", 
  "마법의", "원조"
];

export default function ShadowbanScanner({ lang = "ko" }: ShadowbanScannerProps) {
  const [inputText, setInputText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // 스캔 결과 요약 계산
  const scanResults = useMemo(() => {
    if (!inputText.trim()) {
      return { foundWords: [], count: 0 };
    }

    const found: string[] = [];
    SHADOWBAN_WORDS.forEach(word => {
      // 대소문자 구분 없이 문자열 포함 여부 체크
      if (inputText.toLowerCase().includes(word.toLowerCase())) {
        found.push(word);
      }
    });

    // 중복 제거
    const uniqueFound = Array.from(new Set(found));
    return {
      foundWords: uniqueFound,
      count: uniqueFound.length
    };
  }, [inputText]);

  // 입력 초기화
  const handleClear = () => {
    setInputText("");
  };

  // 클립보드 복사
  const handleCopy = async () => {
    if (!inputText) return;
    try {
      await navigator.clipboard.writeText(inputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      // safe bypass
    }
  };

  // 샘플 제공
  const handleLoadSample = () => {
    setInputText(
      lang === "ko" 
        ? "초단기 부업 정보 공개! 하루 10분 투자해서 100% 수익보장하는 돈버는법 알려드립니다. 비밀 링크를 클릭하고 최고의 다이어트 약 샘플도 무료증정 받으세요!"
        : "Secret recipe to make money online with 100% guaranteed return! Click the link to learn this side hustle and get the best weight loss pill sample for free!"
    );
  };

  // 실시간 텍스트 정규식 분할 하이라이트 렌더링
  const renderHighlightedText = () => {
    if (!inputText) {
      return (
        <span className="text-zinc-400 dark:text-zinc-650 italic">
          {lang === "ko" 
            ? "입력창에 작성한 글이 실시간 분석되어 이곳에 표시됩니다..."
            : "Your text will be analyzed and highlighted in real-time here..."}
        </span>
      );
    }

    // 검출된 위험 단어가 없다면 일반 텍스트 그대로 출력
    if (scanResults.count === 0) {
      return <span>{inputText}</span>;
    }

    // 위험 단어들을 정규식 검색 패턴으로 묶기 (특수문자 이스케이프 적용)
    const escapedWords = SHADOWBAN_WORDS
      .filter(word => inputText.toLowerCase().includes(word.toLowerCase()))
      .map(word => word.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"));
      
    if (escapedWords.length === 0) {
      return <span>{inputText}</span>;
    }

    const regex = new RegExp(`(${escapedWords.join("|")})`, "gi");
    const parts = inputText.split(regex);

    return (
      <>
        {parts.map((part, index) => {
          const isMatch = SHADOWBAN_WORDS.some(
            word => word.toLowerCase() === part.toLowerCase()
          );

          return isMatch ? (
            <mark 
              key={index} 
              className="bg-red-200 text-red-800 dark:bg-red-950/70 dark:text-red-400 font-bold px-1 py-0.5 rounded mx-0.5 transition-all select-all inline-block shadow-sm"
              title="알고리즘 필터링 감지 위험 단어"
            >
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          );
        })}
      </>
    );
  };

  return (
    <div id="shadowban-scanner-container" className="w-full max-w-4xl mx-auto">
      {/* 타이틀 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            🛡️ 섀도우밴 스캐너 (Shadowban Scanner)
            <span className="bg-gradient-to-r from-rose-500 to-cyan-400 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
              NEW
            </span>
          </h2>
          <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-1">
            본 도구는 틱톡, 인스타그램, 유튜브 쇼츠 등 숏폼 플랫폼의 검색 및 피드 노출 제한을 유발하는 민감 단어와 유해 키워드를 검사합니다. 대본 텍스트를 입력하면 필터링 대상 단어를 색출하고, 이를 우회하여 노출을 극대화할 수 있는 추천 대체 단어를 안내합니다.
          </p>
        </div>
      </div>

      {/* 스플릿 뷰 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* LEFT: 텍스트 입력창 */}
        <div className="space-y-4">
          <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center px-1">
              <label htmlFor="scanner-input" className="text-xs font-black text-zinc-850 dark:text-zinc-300 uppercase tracking-wider block">
                📝 스캔할 텍스트 입력
              </label>
              
              <button
                onClick={handleLoadSample}
                className="text-[11px] font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>위험 문장 샘플 채우기</span>
              </button>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl opacity-10 group-focus-within:opacity-30 transition duration-300 blur-sm pointer-events-none" />
              <textarea
                id="scanner-input"
                className="relative w-full h-64 bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl p-4 text-sm leading-relaxed text-zinc-850 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-400/60 transition-colors font-sans resize-none"
                placeholder={
                  lang === "ko" 
                    ? "여기에 숏폼 동영상 제목, 설명글, 혹은 대본 텍스트를 붙여넣으세요..."
                    : "Paste your short-form video title, description, or transcript here to scan..."
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[11px] text-zinc-550 dark:text-zinc-500 font-mono">
                {inputText.length.toLocaleString()} 자 입력됨
              </span>
              
              {inputText && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-250 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-400 cursor-pointer transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "복사 완료" : "복사"}</span>
                  </button>
                  <button
                    onClick={handleClear}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900/60 text-xs font-bold text-red-700 dark:text-red-400 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>초기화</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT: 실시간 스캔 미리보기 및 상태 표시등 */}
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-5">
            
            {/* 상태 표시등 */}
            <div className="px-1">
              <span className="text-xs font-black text-zinc-850 dark:text-zinc-300 uppercase tracking-wider block mb-3">
                🔍 실시간 위험도 분석 결과
              </span>
              
              <AnimatePresence mode="wait">
                {!inputText.trim() ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-900 dark:bg-zinc-900/30 text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-zinc-500" />
                    <span>분석 대기 중... 텍스트를 입력해 주세요.</span>
                  </motion.div>
                ) : scanResults.count === 0 ? (
                  <motion.div
                    key="safe"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-950/30 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs font-black flex items-center gap-2"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>✅ 안전한 텍스트입니다 (유해 단어 감지 안 됨)</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="warn"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-800 dark:border-red-950/30 dark:bg-red-950/20 dark:text-red-400 text-xs font-black flex items-center gap-2"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span>🚨 섀도우밴 위험 단어 {scanResults.count}개 감지됨!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 실시간 하이라이트 텍스트 뷰 */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block px-1">
                👁️ 실시간 하이라이트 미리보기
              </span>
              
              <div className="w-full min-h-[160px] max-h-56 overflow-y-auto bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-900 rounded-xl p-4 text-sm leading-relaxed text-zinc-800 dark:text-zinc-300 font-medium select-text whitespace-pre-wrap">
                {renderHighlightedText()}
              </div>
            </div>

            {/* 검출 리스트 상세 */}
            {scanResults.count > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block px-1">
                  ⚠️ 발견된 민감 단어 목록
                </span>
                <div className="flex flex-wrap gap-1.5 px-1">
                  {scanResults.foundWords.map((word, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-0.5 rounded-md bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 text-xs font-bold border border-red-200/50 dark:border-red-900/40"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* 알고리즘 가이드 안내 배너 */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-900 rounded-2xl text-xs text-zinc-700 dark:text-zinc-400 leading-relaxed space-y-1 flex gap-2">
            <Info className="w-4 h-4 text-zinc-450 dark:text-zinc-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-zinc-850 dark:text-zinc-200 mb-0.5">섀도우밴 필터 작동 원리</h4>
              <span>글로벌 숏폼 플랫폼의 AI 심사 엔진은 스팸 캡션과 과대 선동성 부업 권유 글, 의학적 효능 과장 단어들을 정밀 감식합니다. 검출 시 계정 지수를 강등시키거나, '추천 피드(FYP)' 송출을 자동 제한하는 섀도우밴을 부여합니다. 본 스캐너에서 사전에 붉게 감지된 단어들은 유의어로 우회 대체하여 업로드하시는 것을 강력 권장합니다.</span>
            </div>
          </div>
        </div>

      </div>

      <hr className="my-8 border-zinc-200 dark:border-zinc-800" />
      
      <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 space-y-4 leading-relaxed">
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">💡 섀도우밴 위험 단어 스캐너의 필요성</h4>
          <p>
            틱톡, 유튜브 쇼츠, 인스타그램 릴스, 도우인 등 글로벌 숏폼 알고리즘 시스템은 유해 콘텐츠와 허위 과장 광고를 스크리닝하기 위해 고도로 설계된 텍스트 필터 엔진을 탑재하고 있습니다. 영상 제목, 해시태그, 설명글, 심지어 오디오 자막(STT)에 '100% 수익보장', '다이어트 약', '무조건' 등 자극적인 홍보성이나 확증 편향적인 키워드가 반복 검출될 경우, 플랫폼은 별도의 경고 없이 해당 영상의 노출 지수를 즉각 제한하는 '섀도우밴(Shadowban)'을 작동시킵니다. 이 섀도우밴 위험 단어 스캐너는 크리에이터가 업로드 전 자신의 자막 및 메타데이터를 정밀 대조하여 알고리즘 제한 유발 단어를 실시간 감지하고 수정할 수 있게 유도하여 계정 지수 강등 피해를 미연에 방지합니다.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">📖 100% 활용 가이드</h4>
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>1단계 (텍스트 입력):</strong> 작성해 둔 숏폼 영상의 대본(Script), 제목(Title), 태그(Tags) 또는 본문 설명 텍스트를 입력창에 붙여넣습니다.</li>
            <li><strong>2단계 (실시간 위험도 스캔):</strong> 우측 실시간 분석 결과 패널에서 감지된 섀도우밴 위험 단어의 개수와 위치(붉은색 마킹 처리)를 확인합니다.</li>
            <li><strong>3단계 (단어 순화 및 복사):</strong> 붉은색으로 표기된 유해 가능성 단어를 자극성이 덜한 유의어 및 정보성 키워드로 수정한 뒤, '복사' 버튼을 눌러 최종 확정된 텍스트를 플랫폼에 업로드합니다.</li>
          </ol>
        </div>
        <div>
          <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mb-1">🔥 크리에이터 실전 꿀팁</h4>
          <p>
            플랫폼 심사 봇의 필터링을 우회하려면 극단적인 표현(예: '최고', '비밀', '공짜') 대신 완화된 우회 표현(예: '꿀팁', '핵심 정보', '무상 혜택')을 활용하는 것이 바람직합니다. 또한 사전에 섀도우밴 단어를 완전히 소거하고 정보성에 초점을 맞춘 텍스트를 작성하면, 알고리즘이 해당 콘텐츠를 '정보 제공성 양질 비디오'로 분류하여 초기 시청층(Seed Pool) 도달을 훨씬 매끄럽고 높게 제공해 줍니다.
          </p>
        </div>
      </div>

    </div>
  );
}

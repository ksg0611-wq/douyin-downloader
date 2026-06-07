"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { 
  FolderHeart, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  Loader2, 
  Briefcase, 
  Brain, 
  Magnet, 
  Megaphone, 
  Globe, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";

interface SavedItem {
  id: string;
  toolId: string;
  toolName: string;
  inputData: any;
  resultData: any;
  createdAt: any;
}

export default function MyToolbox() {
  const { user, loading, signInWithGoogle } = useAuth();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setFetching(false);
      return;
    }

    const fetchHistory = async () => {
      setFetching(true);
      try {
        const q = query(
          collection(db, "users", user.uid, "history"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedList: SavedItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedList.push({
            id: doc.id,
            toolId: data.toolId,
            toolName: data.toolName,
            inputData: data.inputData,
            resultData: data.resultData,
            createdAt: data.createdAt
          });
        });
        setItems(fetchedList);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchHistory();
  }, [user, loading]);

  const handleDelete = async (itemId: string) => {
    if (!user) return;
    if (!confirm("정말 이 보관 내역을 삭제하시겠습니까?")) return;

    try {
      await deleteDoc(doc(db, "users", user.uid, "history", itemId));
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      alert("보관 내역이 삭제되었습니다.");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  const getCopyText = (item: SavedItem) => {
    const res = item.resultData;
    if (!res) return "";

    switch (item.toolId) {
      case "sponsor-pitch-generator":
        return `[이메일 제목]\n${res.subject}\n\n[인사말]\n${res.greeting}\n\n[채널 어필 포인트]\n${res.channelAppeal}\n\n[브랜드 시너지]\n${res.synergy}\n\n[숏폼 기획안]\n${res.concept}\n\n[마무리]\n${res.closing}`;
      case "viral-analyzer":
        return `[3초 후킹 포인트]\n${res.hook}\n\n[이탈 방지 전개 방식]\n${res.body}\n\n[행동 유도 전략]\n${res.cta}\n\n[변형 아이디어]\n${res.ideas?.join("\n")}`;
      case "thumbnail-text-generator":
        return `[매운맛 썸네일 카피]\n${res.spicy?.join("\n")}\n\n[순한맛 썸네일 카피]\n${res.mild?.join("\n")}`;
      case "algo-hook-generator":
        return `[행동유도 CTA]\n${res.cta?.join("\n")}\n\n[댓글 유도 질문]\n${res.comment?.join("\n")}`;
      case "upload-time-calculator":
        return `[현지 골든 아워] ${res.targetLocalTime}\n[한국 기준 예약 시간] ${res.koreanTime}\n[추천 근거]\n${res.reason}`;
      default:
        return typeof res === "string" ? res : JSON.stringify(res, null, 2);
    }
  };

  const handleCopy = async (item: SavedItem) => {
    const fullText = getCopyText(item);
    if (!fullText) return;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (e) {
      console.error("복사 실패:", e);
    }
  };

  const formatDate = (createdAt: any) => {
    if (!createdAt) return "";
    let dateObj: Date;
    if (typeof createdAt.toDate === "function") {
      dateObj = createdAt.toDate();
    } else if (createdAt.seconds) {
      dateObj = new Date(createdAt.seconds * 1000);
    } else {
      dateObj = new Date(createdAt);
    }
    return dateObj.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getToolIcon = (toolId: string) => {
    switch (toolId) {
      case "sponsor-pitch-generator":
        return <Briefcase className="w-4 h-4 text-emerald-500" />;
      case "viral-analyzer":
        return <Brain className="w-4 h-4 text-rose-500" />;
      case "thumbnail-text-generator":
        return <Magnet className="w-4 h-4 text-amber-500" />;
      case "algo-hook-generator":
        return <Megaphone className="w-4 h-4 text-purple-500" />;
      case "upload-time-calculator":
        return <Globe className="w-4 h-4 text-blue-500" />;
      default:
        return <FolderHeart className="w-4 h-4 text-zinc-500" />;
    }
  };

  const getBorderColor = (toolId: string) => {
    switch (toolId) {
      case "sponsor-pitch-generator":
        return "border-emerald-500/30 dark:border-emerald-500/20 hover:border-emerald-500/60";
      case "viral-analyzer":
        return "border-rose-500/30 dark:border-rose-500/20 hover:border-rose-500/60";
      case "thumbnail-text-generator":
        return "border-amber-500/30 dark:border-amber-500/20 hover:border-amber-500/60";
      case "algo-hook-generator":
        return "border-purple-500/30 dark:border-purple-500/20 hover:border-purple-500/60";
      case "upload-time-calculator":
        return "border-blue-500/30 dark:border-blue-500/20 hover:border-blue-500/60";
      default:
        return "border-zinc-200 dark:border-zinc-800 hover:border-zinc-500";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-[#060609] dark:text-zinc-100 font-sans flex flex-col transition-colors duration-300">
      <Header />

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-10 md:py-16 z-10">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link 
            href="/downloader" 
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-650 hover:text-zinc-900 dark:text-zinc-450 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>다운로더 메인으로 돌아가기</span>
          </Link>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
          <h2 className="text-xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            내 도구상자 (보관된 히스토리)
          </h2>
        </div>

        {/* Auth Loading */}
        {(loading || fetching) && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            <p className="text-xs sm:text-sm text-zinc-500">데이터를 안전하게 불러오는 중입니다...</p>
          </div>
        )}

        {/* Not Logged In State */}
        {!loading && !fetching && !user && (
          <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-900 rounded-2xl p-8 max-w-md mx-auto text-center space-y-6 shadow-xl">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto">
              <FolderHeart className="w-7 h-7 text-red-500 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">로그인이 필요합니다</h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                도구상자는 로그인한 유저에게만 보관 및 로드 기능이 제공되는 공간입니다. 구글 로그인 후 편하게 사용해 보세요!
              </p>
            </div>
            <button
              onClick={signInWithGoogle}
              className="w-full py-3 rounded-xl bg-zinc-950 text-white hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100 font-extrabold text-sm transition-all cursor-pointer shadow-md"
            >
              구글 계정으로 로그인하기
            </button>
          </div>
        )}

        {/* Logged In & Empty State */}
        {!loading && !fetching && user && items.length === 0 && (
          <div className="bg-white border border-zinc-200 dark:bg-zinc-950/60 dark:border-zinc-900 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <FolderHeart className="w-12 h-12 mx-auto text-zinc-350 dark:text-zinc-700 opacity-50" />
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">보관된 분석 내역이 없습니다</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                5대 AI 분석 도구(협찬제안서, 바이럴역설계, 썸네일카피 등)를 사용한 후, 결과 창에서 [도구상자에 저장] 버튼을 눌러보세요.
              </p>
            </div>
            <div className="pt-2">
              <Link 
                href="/downloader" 
                className="inline-flex items-center justify-center py-2.5 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:brightness-105 active:scale-95 text-white font-bold text-xs shadow-md transition-all"
              >
                도구 사용해보기 ➔
              </Link>
            </div>
          </div>
        )}

        {/* Logged In & Has Saved List */}
        {!loading && !fetching && user && items.length > 0 && (
          <div className="grid grid-cols-1 gap-8">
            {items.map((item) => (
              <div 
                key={item.id}
                className={`bg-white border dark:bg-zinc-950/60 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-300 ${getBorderColor(item.toolId)}`}
              >
                {/* Header of Item */}
                <div className="bg-zinc-100/60 dark:bg-zinc-900/40 px-5 py-4 border-b border-zinc-200/60 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {getToolIcon(item.toolId)}
                    <span className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white">
                      {item.toolName}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(item)}
                      className={`p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                        copiedId === item.id
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300"
                          : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                      }`}
                      title="전체 텍스트 다시 복사"
                    >
                      {copiedId === item.id ? <CheckCircle2 className="w-4 h-4 animate-scale" /> : <Copy className="w-4 h-4" />}
                      <span className="hidden sm:inline">{copiedId === item.id ? "복사됨" : "다시 복사"}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg border border-red-200/50 hover:bg-red-500/10 text-red-500 dark:border-red-950/30 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                      title="보관함에서 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">삭제</span>
                    </button>
                  </div>
                </div>

                {/* Input Parameters */}
                {item.inputData && (
                  <div className="px-5 pt-4 pb-1 flex flex-wrap gap-2 text-[10px] sm:text-xs text-zinc-500 border-b border-dashed border-zinc-200/60 dark:border-zinc-850">
                    <span className="font-extrabold text-zinc-700 dark:text-zinc-400">입력값:</span>
                    {Object.entries(item.inputData).map(([key, value]) => (
                      <span key={key} className="bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200/40 dark:border-zinc-850">
                        {key === "channelTopic" ? "채널주제: " : key === "targetAudience" ? "시청자층: " : key === "targetBrand" ? "타겟브랜드: " : key === "topic" ? "주제: " : key === "content" ? "내용: " : key === "country" ? "국가: " : key === "platform" ? "플랫폼: " : `${key}: `}
                        {String(value)}
                      </span>
                    ))}
                  </div>
                )}

                {/* Result Data rendering based on toolId */}
                <div className="p-5 text-xs sm:text-sm leading-relaxed text-zinc-850 dark:text-zinc-300 whitespace-pre-wrap max-h-[350px] overflow-y-auto custom-scrollbar">
                  
                  {/* 1. 협찬 제안서 */}
                  {item.toolId === "sponsor-pitch-generator" && item.resultData && (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-black text-zinc-500 tracking-wider">제목:</span>
                        <p className="font-extrabold text-zinc-900 dark:text-white">{item.resultData.subject}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-zinc-500 tracking-wider">인사말:</span>
                        <p>{item.resultData.greeting}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800 p-3.5 rounded-xl">
                          <span className="text-[10px] font-black text-teal-600 dark:text-teal-400 block mb-1">📢 채널 어필 포인트</span>
                          <p className="text-xs">{item.resultData.channelAppeal}</p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800 p-3.5 rounded-xl">
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 block mb-1">🤝 예상 시너지</span>
                          <p className="text-xs">{item.resultData.synergy}</p>
                        </div>
                      </div>
                      <div className="bg-teal-50/20 dark:bg-teal-950/10 border border-teal-100/50 dark:border-teal-950/60 p-3.5 rounded-xl">
                        <span className="text-[10px] font-black text-teal-700 dark:text-teal-300 block mb-1">💡 제안하는 숏폼 기획안</span>
                        <p className="text-xs">{item.resultData.concept}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-zinc-500 tracking-wider">맺음말:</span>
                        <p>{item.resultData.closing}</p>
                      </div>
                    </div>
                  )}

                  {/* 2. 바이럴 영상 역설계 */}
                  {item.toolId === "viral-analyzer" && item.resultData && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800 p-3.5 rounded-xl">
                          <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 block mb-1">🪝 3초 후킹 포인트</span>
                          <p className="text-xs font-semibold">{item.resultData.hook}</p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800 p-3.5 rounded-xl">
                          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 block mb-1">📈 이탈 방지 전개 방식</span>
                          <p className="text-xs font-semibold">{item.resultData.body}</p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800 p-3.5 rounded-xl">
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 block mb-1">🎯 행동 유도 전략</span>
                          <p className="text-xs font-semibold">{item.resultData.cta}</p>
                        </div>
                      </div>
                      {item.resultData.ideas && (
                        <div className="border-t border-dashed border-zinc-200 dark:border-zinc-850 pt-4">
                          <span className="text-[10px] font-black text-rose-600 dark:text-rose-450 block mb-2">💡 내 채널 적용 변형 아이디어</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {item.resultData.ideas.map((idea: string, i: number) => (
                              <div key={i} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-3 rounded-lg text-xs font-medium">
                                {idea}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. 썸네일 텍스트 생성 */}
                  {item.toolId === "thumbnail-text-generator" && item.resultData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-rose-50/10 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-950/30 p-4 rounded-xl space-y-2.5">
                        <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 block pb-1 border-b border-rose-100/30 dark:border-rose-950/30">🌶️ 매운맛 썸네일 카피</span>
                        {item.resultData.spicy?.map((text: string, i: number) => (
                          <p key={i} className="text-xs font-bold">"{text}"</p>
                        ))}
                      </div>
                      <div className="bg-indigo-50/10 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-950/30 p-4 rounded-xl space-y-2.5">
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 block pb-1 border-b border-indigo-100/30 dark:border-indigo-950/30">🌿 순한맛 썸네일 카피</span>
                        {item.resultData.mild?.map((text: string, i: number) => (
                          <p key={i} className="text-xs font-bold">"{text}"</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. 알고리즘 CTA 생성 */}
                  {item.toolId === "algo-hook-generator" && item.resultData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-purple-50/10 dark:bg-purple-950/10 border border-purple-100/50 dark:border-purple-950/30 p-4 rounded-xl space-y-2.5">
                        <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 block pb-1 border-b border-purple-100/30 dark:border-purple-950/30">🚀 행동 유도 (CTA) 멘트</span>
                        {item.resultData.cta?.map((text: string, i: number) => (
                          <p key={i} className="text-xs font-bold">"{text}"</p>
                        ))}
                      </div>
                      <div className="bg-cyan-50/10 dark:bg-cyan-950/10 border border-cyan-100/50 dark:border-cyan-950/30 p-4 rounded-xl space-y-2.5">
                        <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 block pb-1 border-b border-cyan-100/30 dark:border-cyan-950/30">💬 알고리즘 고정댓글 질문</span>
                        {item.resultData.comment?.map((text: string, i: number) => (
                          <p key={i} className="text-xs font-bold">"{text}"</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. 글로벌 최적 업로드 타임 */}
                  {item.toolId === "upload-time-calculator" && item.resultData && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50/10 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-950/30 p-4 rounded-xl flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 block mb-1">⏰ 현지 타겟 골든 아워</span>
                          <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">{item.resultData.targetLocalTime}</p>
                        </div>
                      </div>
                      <div className="bg-emerald-50/10 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-950/30 p-4 rounded-xl flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 block mb-1">🇰🇷 한국 예약 기준 시간 (KST)</span>
                          <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">{item.resultData.koreanTime}</p>
                        </div>
                      </div>
                      <div className="bg-rose-50/10 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-950/30 p-4 rounded-xl md:col-span-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 block mb-1">💡 추천 상세 이유</span>
                          <p className="text-[11px] text-zinc-550 dark:text-zinc-400 font-semibold">{item.resultData.reason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <div className="bg-white dark:bg-[#060609] border-t border-zinc-200 dark:border-zinc-900">
        <Footer />
      </div>
    </div>
  );
}

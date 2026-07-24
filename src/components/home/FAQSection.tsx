import React from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { FAQS } from "../../data";

interface FAQSectionProps {
  expandedFaqId: string | null;
  setExpandedFaqId: (id: string | null) => void;
}

export default function FAQSection({ expandedFaqId, setExpandedFaqId }: FAQSectionProps) {
  return (
    <section id="faq-section" className="my-10 md:my-16 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          자주 묻는 질문 (FAQ)
        </h3>
        <p className="text-xs text-zinc-555 dark:text-zinc-500 mt-1">
          클린 비디오 추출 및 벤치마킹 시스템에 관해 가장 많은 질문들을 모았습니다.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq) => {
          const isOpen = expandedFaqId === faq.id;
          return (
            <div 
              key={faq.id} 
              className="bg-white border border-zinc-200 dark:bg-zinc-950/50 dark:border-zinc-900/80 rounded-xl overflow-hidden transition-all duration-300 shadow-sm"
            >
              <button
                onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                className="w-full text-left p-4.5 font-bold text-sm sm:text-base text-zinc-800 hover:text-zinc-950 dark:text-zinc-200 dark:hover:text-white flex items-center justify-between gap-4 cursor-pointer"
              >
                <span>{faq.question}</span>
                <span className={`p-1 bg-zinc-105 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 rounded-lg shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-zinc-200 dark:border-zinc-900 p-4.5 text-xs sm:text-sm text-zinc-650 leading-relaxed whitespace-pre-line bg-zinc-50/50 dark:text-zinc-400 dark:bg-zinc-950/80">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </section>
  );
}

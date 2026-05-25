import React from "react";
import { motion, AnimatePresence } from "motion/react";
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
        <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-400" />
          자주 묻는 질문 (FAQ)
        </h3>
        <p className="text-xs text-zinc-500 mt-1">
          워터마크 제어 처리 장치와 보안 규정에 관해 가장 많은 질문들을 모았습니다.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq) => {
          const isOpen = expandedFaqId === faq.id;
          return (
            <div 
              key={faq.id} 
              className="bg-zinc-950/50 border border-zinc-900/80 rounded-xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                className="w-full text-left p-4.5 font-bold text-sm sm:text-base text-zinc-200 hover:text-white flex items-center justify-between gap-4 cursor-pointer"
              >
                <span>{faq.question}</span>
                <span className={`p-1 bg-zinc-900 text-zinc-400 rounded-lg shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-zinc-900"
                  >
                    <p className="p-4.5 text-xs sm:text-sm text-zinc-400 leading-relaxed whitespace-pre-line bg-zinc-950/80">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import React, { useEffect, useState } from "react";

interface AdBannerProps {
  position: "top" | "bottom" | "sidebar" | "content";
  adSlot?: string;
}

export default function AdBanner({ position, adSlot }: AdBannerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    try {
      if (typeof window !== "undefined") {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
      }
    } catch (e) {
      console.error("[AdSense] Initialization push failed:", e);
    }
  }, [isMounted]);

  // Default placeholder slot IDs for ca-pub-1959341960002320
  // These can be replaced with actual unit slots from AdSense console.
  const defaultSlots = {
    top: "3748291048",
    bottom: "9827401928",
    sidebar: "5829102938",
    content: "1029384756"
  };

  const currentSlot = adSlot || defaultSlots[position] || defaultSlots.bottom;

  // Hydration-Free logic: Server renders a clean skeleton container with matching layout.
  // This avoids hydration mismatch warning when AdSense injects script and alters DOM.
  if (!isMounted) {
    return (
      <div 
        className={`w-full max-w-4xl mx-auto ${
          position === "top" ? "mt-4" : "my-8"
        } min-h-[100px] bg-transparent`}
      />
    );
  }

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div 
      className={`w-full max-w-4xl mx-auto ${
        position === "top" ? "mt-4" : "my-8"
      } bg-transparent flex flex-col items-center justify-center text-center overflow-hidden relative border border-zinc-200/20 dark:border-zinc-800/40 rounded-xl p-3`}
    >
      <span className="text-zinc-400 dark:text-zinc-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mb-2">
        Advertisement
      </span>

      {isDev && (
        <div className="text-[10px] text-rose-500 font-mono mb-2">
          [Development mode] Client: ca-pub-1959341960002320 | Slot: {currentSlot}
        </div>
      )}

      <div className="w-full overflow-hidden flex justify-center min-h-[90px]">
        <ins
          className="adsbygoogle"
          style={{ display: "block", minWidth: "250px", width: "100%" }}
          data-ad-client="ca-pub-1959341960002320"
          data-ad-slot={currentSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}

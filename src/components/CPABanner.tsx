import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AdData } from "@/data/ads";

interface CPABannerProps {
  ad: AdData;
  type?: "horizontal" | "card";
}

export default function CPABanner({ ad, type = "horizontal" }: CPABannerProps) {
  const isHorizontal = type === "horizontal";

  return (
    <Link 
      href={ad.linkUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`group relative block overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        isHorizontal ? "flex flex-col sm:flex-row items-center w-full" : "flex flex-col w-full max-w-sm mx-auto"
      }`}
    >
      {/* AD Badge */}
      <div className="absolute top-2 right-2 z-10 bg-black/60 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-widest backdrop-blur-sm pointer-events-none">
        Sponsored
      </div>

      {/* Image Container */}
      <div className={`relative bg-zinc-100 overflow-hidden ${
        isHorizontal ? "w-full sm:w-1/3 aspect-[2/1] sm:aspect-auto sm:h-32" : "w-full aspect-[16/9]"
      }`}>
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Text Container */}
      <div className={`flex flex-col justify-center p-4 sm:p-5 ${
        isHorizontal ? "w-full sm:w-2/3" : "w-full"
      }`}>
        <h4 className="text-base sm:text-lg font-bold text-zinc-900 group-hover:text-rose-600 transition-colors line-clamp-1">
          {ad.title}
        </h4>
        <p className="text-zinc-500 text-xs sm:text-sm mt-1.5 line-clamp-2 leading-relaxed">
          {ad.description}
        </p>
        <div className="mt-3 inline-flex items-center text-xs font-bold text-rose-600">
          알아보기 &rarr;
        </div>
      </div>
    </Link>
  );
}

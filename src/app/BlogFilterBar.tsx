"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface BlogFilterBarProps {
  availableTags: string[];
}

export default function BlogFilterBar({ availableTags }: BlogFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTag = searchParams.get("tag")?.toUpperCase() || "ALL";

  const handleTagChange = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tag === "ALL") {
      params.delete("tag");
    } else {
      params.set("tag", tag.toLowerCase());
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-full border border-zinc-200/50 dark:border-zinc-800/50">
      {availableTags.map((tag) => {
        const isActive = activeTag === tag;
        return (
          <button
            key={tag}
            onClick={() => handleTagChange(tag)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-[1.03]"
                : "text-zinc-650 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}

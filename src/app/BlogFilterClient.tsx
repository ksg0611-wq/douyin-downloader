"use client";

import React, { Suspense, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface FilterBarProps {
  availableTags: string[];
}

function FilterBarInner({ availableTags }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag")?.toUpperCase() || "ALL";

  // Client-side filtering: toggle visibility of server-rendered cards via DOM
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>("#blog-grid [data-category]");
    cards.forEach((card) => {
      const category = card.getAttribute("data-category");
      if (activeTag === "ALL" || category === activeTag) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  }, [activeTag]);

  const handleTagChange = useCallback(
    (tag: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tag === "ALL") {
        params.delete("tag");
      } else {
        params.set("tag", tag.toLowerCase());
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

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

export default function BlogFilterClient({ availableTags }: FilterBarProps) {
  return (
    <Suspense
      fallback={
        <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-full border border-zinc-200/50 dark:border-zinc-800/50">
          {availableTags.map((tag) => (
            <span
              key={tag}
              className="px-4 py-2 rounded-full text-xs font-bold text-zinc-400 whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
        </div>
      }
    >
      <FilterBarInner availableTags={availableTags} />
    </Suspense>
  );
}

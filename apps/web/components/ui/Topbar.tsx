"use client";

import { useEffect, useState } from "react";

export function Topbar({ title }: { title: string }) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const updateScrollState = () => {
      const nextProgress = Math.min(window.scrollY / 96, 1);
      setScrollProgress(nextProgress);
      frame = 0;
    };

    const onScroll = () => {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(updateScrollState);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  const isCompact = scrollProgress > 0.45;

  return (
    <header
      className={`sticky top-0 z-20 border-b px-4 text-zinc-950 backdrop-blur motion-overlay dark:text-zinc-50 md:px-6 ${
        isCompact ? "py-2" : "py-3"
      } ${
        scrollProgress > 0
          ? "border-zinc-200 bg-white/90 shadow-[0_8px_24px_rgba(24,24,27,0.1)] backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90 dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
          : "border-zinc-200 bg-white/96 shadow-none backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/96"
      }`}
    >
      <h1
        className={`font-semibold tracking-tight transition-all motion-state ${
          isCompact ? "text-base" : "text-lg"
        }`}
      >
        {title}
      </h1>
    </header>
  );
}

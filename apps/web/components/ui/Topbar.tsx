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
      className={`sticky top-0 z-20 border-b px-4 text-zinc-950 motion-overlay dark:text-zinc-50 md:px-6 ${
        isCompact ? "py-2" : "py-3"
      } ${
        scrollProgress > 0
          ? "glass-bg border-[color:var(--glass-border)] surface-blur-strong elevation-2 surface-noise glass-edge-highlight"
          : "glass-bg border-[color:var(--glass-border)] surface-blur-soft elevation-1 surface-noise glass-edge-highlight"
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

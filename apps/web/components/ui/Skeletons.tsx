"use client";

import type { ReactElement } from "react";

type SkeletonVariant = "line" | "card" | "table" | "avatar";
type SkeletonDensity = "compact" | "normal" | "comfortable";

type SkeletonsProps = {
  rows?: number;
  variant?: SkeletonVariant;
  density?: SkeletonDensity;
};

const densityClasses: Record<SkeletonDensity, string> = {
  compact: "space-y-2",
  normal: "space-y-3",
  comfortable: "space-y-4"
};

const shimmerBase =
  "animate-[skeleton-shimmer_1.7s_linear_infinite] rounded-lg bg-[length:250%_100%] bg-[linear-gradient(110deg,rgba(228,228,231,0.58)_8%,rgba(244,244,245,0.9)_18%,rgba(228,228,231,0.58)_33%)] dark:bg-[linear-gradient(110deg,rgba(39,39,42,0.52)_8%,rgba(63,63,70,0.75)_18%,rgba(39,39,42,0.52)_33%)]";

function lineVariant(rows: number, density: SkeletonDensity) {
  const lineHeights: Record<SkeletonDensity, string> = {
    compact: "h-3.5",
    normal: "h-4",
    comfortable: "h-5"
  };

  return (
    <div className={densityClasses[density]}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className={`${shimmerBase} ${lineHeights[density]} ${idx % 3 === 1 ? "w-11/12 opacity-80" : idx % 3 === 2 ? "w-10/12 opacity-70" : "w-full opacity-90"}`}
          style={{ animationDelay: `${idx * 110}ms` }}
        />
      ))}
    </div>
  );
}

function cardVariant(rows: number, density: SkeletonDensity) {
  const cardSpacing: Record<SkeletonDensity, string> = {
    compact: "space-y-2.5",
    normal: "space-y-3",
    comfortable: "space-y-4"
  };

  return (
    <div className={densityClasses[density]}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className={`rounded-xl border border-zinc-200/70 p-3 dark:border-zinc-800/80 ${cardSpacing[density]}`}>
          <div className={`${shimmerBase} h-5 w-1/3 opacity-85`} style={{ animationDelay: `${idx * 120}ms` }} />
          <div className={`${shimmerBase} h-4 w-full opacity-75`} style={{ animationDelay: `${idx * 120 + 60}ms` }} />
          <div className={`${shimmerBase} h-4 w-5/6 opacity-65`} style={{ animationDelay: `${idx * 120 + 120}ms` }} />
        </div>
      ))}
    </div>
  );
}

function tableVariant(rows: number, density: SkeletonDensity) {
  const rowHeights: Record<SkeletonDensity, string> = {
    compact: "h-8",
    normal: "h-10",
    comfortable: "h-12"
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
      <div className="grid grid-cols-4 gap-3 border-b border-zinc-200/80 bg-zinc-100/50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className={`${shimmerBase} h-3.5 opacity-80 ${idx === 0 ? "w-4/5" : "w-3/4"}`}
            style={{ animationDelay: `${idx * 100}ms` }}
          />
        ))}
      </div>
      <div className={densityClasses[density]}>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className={`grid grid-cols-4 gap-3 border-b border-zinc-200/70 px-3 py-2 last:border-b-0 dark:border-zinc-800/70 ${rowHeights[density]}`}>
            {Array.from({ length: 4 }).map((_, colIdx) => (
              <div
                key={colIdx}
                className={`${shimmerBase} h-3.5 ${colIdx === 0 ? "w-[88%]" : colIdx === 3 ? "w-2/3 opacity-70" : "w-4/5 opacity-80"}`}
                style={{ animationDelay: `${rowIdx * 90 + colIdx * 70}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function avatarVariant(rows: number, density: SkeletonDensity) {
  const rowHeights: Record<SkeletonDensity, string> = {
    compact: "h-10",
    normal: "h-12",
    comfortable: "h-14"
  };
  const avatarSizes: Record<SkeletonDensity, string> = {
    compact: "h-8 w-8",
    normal: "h-10 w-10",
    comfortable: "h-12 w-12"
  };

  return (
    <div className={densityClasses[density]}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className={`flex items-center gap-3 ${rowHeights[density]}`}>
          <div className={`${shimmerBase} ${avatarSizes[density]} rounded-full opacity-85`} style={{ animationDelay: `${idx * 120}ms` }} />
          <div className="flex-1 space-y-2">
            <div className={`${shimmerBase} h-4 w-2/5 opacity-80`} style={{ animationDelay: `${idx * 120 + 50}ms` }} />
            <div className={`${shimmerBase} h-3.5 w-3/5 opacity-65`} style={{ animationDelay: `${idx * 120 + 100}ms` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Skeletons({ rows, variant = "line", density = "normal" }: SkeletonsProps) {
  const effectiveRows = rows ?? (variant === "table" ? 4 : variant === "avatar" ? 5 : 3);

  const skeletonByVariant: Record<SkeletonVariant, ReactElement> = {
    line: lineVariant(effectiveRows, density),
    card: cardVariant(effectiveRows, density),
    table: tableVariant(effectiveRows, density),
    avatar: avatarVariant(effectiveRows, density)
  };

  return (
    <div className="space-y-2" role="status" aria-live="polite" aria-label="Cargando contenido">
      {skeletonByVariant[variant]}
    </div>
  );
}

"use client";

import type { CSSProperties, ReactElement } from "react";

type SkeletonVariant = "line" | "card" | "table" | "avatar" | "dashboard" | "form" | "timeline" | "kanban";
type SkeletonDensity = "compact" | "normal" | "comfortable";

type SkeletonsProps = {
  rows?: number;
  columns?: number;
  variant?: SkeletonVariant;
  density?: SkeletonDensity;
};

const densityClasses: Record<SkeletonDensity, string> = {
  compact: "space-y-2",
  normal: "space-y-3",
  comfortable: "space-y-4"
};

const shimmerBase =
  "animate-[skeleton-shimmer_1.95s_ease-in-out_infinite] rounded-lg bg-[length:220%_100%] bg-[linear-gradient(110deg,rgba(228,228,231,0.34)_10%,rgba(244,244,245,0.56)_22%,rgba(228,228,231,0.34)_38%)] dark:bg-[linear-gradient(110deg,rgba(39,39,42,0.3)_10%,rgba(63,63,70,0.52)_22%,rgba(39,39,42,0.3)_38%)]";

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

function tableVariant(rows: number, density: SkeletonDensity, columns: number) {
  const rowHeights: Record<SkeletonDensity, string> = {
    compact: "h-8",
    normal: "h-10",
    comfortable: "h-12"
  };
  const normalizedColumns = Math.max(1, Math.min(columns, 10));
  const gridStyle: CSSProperties = { gridTemplateColumns: `repeat(${normalizedColumns}, minmax(0, 1fr))` };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800/80">
      <div className="grid gap-3 border-b border-zinc-200/80 bg-zinc-100/50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/50" style={gridStyle}>
        {Array.from({ length: normalizedColumns }).map((_, idx) => (
          <div
            key={idx}
            className={`${shimmerBase} h-3.5 opacity-80 ${idx === 0 ? "w-4/5" : "w-3/4"}`}
            style={{ animationDelay: `${idx * 100}ms` }}
          />
        ))}
      </div>
      <div className={densityClasses[density]}>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className={`grid gap-3 border-b border-zinc-200/70 px-3 py-2 last:border-b-0 dark:border-zinc-800/70 ${rowHeights[density]}`} style={gridStyle}>
            {Array.from({ length: normalizedColumns }).map((_, colIdx) => (
              <div
                key={colIdx}
                className={`${shimmerBase} h-3.5 ${colIdx === 0 ? "w-[88%]" : colIdx === normalizedColumns - 1 ? "w-2/3 opacity-70" : "w-4/5 opacity-80"}`}
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

function dashboardVariant(rows: number, density: SkeletonDensity) {
  return (
    <div className={`grid gap-3 md:grid-cols-3 ${density === "compact" ? "md:gap-2.5" : density === "comfortable" ? "md:gap-4" : ""}`}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="rounded-xl border border-zinc-200/80 p-3 dark:border-zinc-800/80">
          <div className={`${shimmerBase} mb-3 h-3.5 w-2/5 opacity-70`} style={{ animationDelay: `${idx * 80}ms` }} />
          <div className={`${shimmerBase} h-8 w-1/2 opacity-80`} style={{ animationDelay: `${idx * 80 + 60}ms` }} />
        </div>
      ))}
    </div>
  );
}

function formVariant(density: SkeletonDensity) {
  const gapClass = density === "compact" ? "gap-2.5" : density === "comfortable" ? "gap-4" : "gap-3";
  return (
    <div className={`rounded-xl border border-zinc-200/80 p-4 dark:border-zinc-800/80 ${gapClass}`}>
      <div className={`${shimmerBase} mb-3 h-5 w-2/6 opacity-85`} />
      <div className={`grid ${gapClass} md:grid-cols-2`}>
        <div className="space-y-2">
          <div className={`${shimmerBase} h-3.5 w-1/3 opacity-70`} />
          <div className={`${shimmerBase} h-10 w-full opacity-80`} />
        </div>
        <div className="space-y-2">
          <div className={`${shimmerBase} h-3.5 w-1/3 opacity-70`} />
          <div className={`${shimmerBase} h-10 w-full opacity-80`} />
        </div>
        <div className="space-y-2">
          <div className={`${shimmerBase} h-3.5 w-1/3 opacity-70`} />
          <div className={`${shimmerBase} h-10 w-full opacity-80`} />
        </div>
      </div>
      <div className={`${shimmerBase} mt-3 h-10 w-32 opacity-85`} />
    </div>
  );
}

function timelineVariant(rows: number, density: SkeletonDensity) {
  const itemSpacing = density === "compact" ? "space-y-3" : density === "comfortable" ? "space-y-5" : "space-y-4";
  return (
    <div className={`relative border-l border-zinc-200/70 pl-4 dark:border-zinc-800/70 ${itemSpacing}`}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="relative">
          <div className="absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full border border-zinc-200/80 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900" />
          <div className={`${shimmerBase} mb-2 h-3.5 w-1/4 opacity-70`} style={{ animationDelay: `${idx * 90}ms` }} />
          <div className={`${shimmerBase} h-4 w-11/12 opacity-80`} style={{ animationDelay: `${idx * 90 + 50}ms` }} />
        </div>
      ))}
    </div>
  );
}

function kanbanVariant(rows: number) {
  const columns = Math.max(2, Math.min(rows, 4));
  return (
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: columns }).map((_, colIdx) => (
        <div key={colIdx} className="rounded-xl border border-zinc-200/80 p-3 dark:border-zinc-800/80">
          <div className={`${shimmerBase} mb-3 h-4 w-2/3 opacity-75`} style={{ animationDelay: `${colIdx * 100}ms` }} />
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((__, cardIdx) => (
              <div key={cardIdx} className="rounded-lg border border-zinc-200/70 p-2 dark:border-zinc-800/70">
                <div className={`${shimmerBase} h-3.5 w-5/6 opacity-80`} style={{ animationDelay: `${colIdx * 100 + cardIdx * 70}ms` }} />
                <div className={`${shimmerBase} mt-2 h-3 w-2/3 opacity-65`} style={{ animationDelay: `${colIdx * 100 + cardIdx * 70 + 30}ms` }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Skeletons({ rows, columns = 4, variant = "line", density = "normal" }: SkeletonsProps) {
  const effectiveRows =
    rows ??
    (variant === "table" ? 4 : variant === "avatar" ? 5 : variant === "dashboard" ? 3 : variant === "timeline" ? 4 : variant === "kanban" ? 3 : 3);

  const skeletonByVariant: Record<SkeletonVariant, ReactElement> = {
    line: lineVariant(effectiveRows, density),
    card: cardVariant(effectiveRows, density),
    table: tableVariant(effectiveRows, density, columns),
    avatar: avatarVariant(effectiveRows, density),
    dashboard: dashboardVariant(effectiveRows, density),
    form: formVariant(density),
    timeline: timelineVariant(effectiveRows, density),
    kanban: kanbanVariant(effectiveRows)
  };

  return (
    <div className="space-y-2" role="status" aria-live="polite" aria-label="Cargando contenido">
      {skeletonByVariant[variant]}
    </div>
  );
}

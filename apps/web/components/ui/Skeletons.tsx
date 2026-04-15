"use client";

export function Skeletons({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2" role="status" aria-live="polite" aria-label="Cargando contenido">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-10 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      ))}
    </div>
  );
}

"use client";

export function Topbar({ title }: { title: string }) {
  return (
    <div className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 p-4 text-base font-semibold tracking-tight backdrop-blur">
      {title}
    </div>
  );
}

"use client";

export function Topbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 md:px-6">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
    </header>
  );
}

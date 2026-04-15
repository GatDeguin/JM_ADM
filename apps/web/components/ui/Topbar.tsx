"use client";

export function Topbar({ title }: { title: string }) {
  return (
    <header className="glass-bg sticky top-0 z-20 border-b border-zinc-200 px-4 py-3 backdrop-blur motion-overlay dark:border-zinc-800 md:px-6">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
    </header>
  );
}

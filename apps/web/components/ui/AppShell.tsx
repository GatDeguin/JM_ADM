"use client";

export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="glass-bg elevation-1 surface-noise min-h-screen pb-20 text-zinc-900 md:flex md:pb-0 dark:text-zinc-100">{children}</div>;
}

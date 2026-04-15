"use client";

export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-zinc-50 pb-20 text-zinc-900 md:flex md:pb-0 dark:bg-zinc-950 dark:text-zinc-100">{children}</div>;
}

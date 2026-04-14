"use client";

export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-zinc-50 pb-20 md:pb-0 md:flex">{children}</div>;
}

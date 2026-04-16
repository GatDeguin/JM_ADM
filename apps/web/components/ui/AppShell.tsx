"use client";

export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f6f7fb] text-zinc-900 md:flex">{children}</div>;
}

"use client";

import { AppShell } from "./ui/AppShell";
import { Sidebar } from "./ui/Sidebar";
import { BottomTabs } from "./ui/BottomTabs";
import { Topbar } from "./ui/Topbar";

export function Layout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <AppShell>
      <Sidebar />
      <main className="flex-1">
        <Topbar title={title} />
        <div className="mx-auto w-full max-w-7xl space-y-4 p-4 md:p-6">{children}</div>
      </main>
      <BottomTabs />
    </AppShell>
  );
}

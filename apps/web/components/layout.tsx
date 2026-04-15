"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { AppShell } from "./ui/AppShell";
import { Sidebar } from "./ui/Sidebar";
import { BottomTabs } from "./ui/BottomTabs";
import { Topbar } from "./ui/Topbar";
import { BrandIntro } from "./ui/BrandIntro";
import { RouteProgress } from "./ui/RouteProgress";

export function Layout({ title, children }: { title: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [enableMotion, setEnableMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const cpuCores = navigator.hardwareConcurrency ?? 4;
    const isLowPowerDevice = Boolean(connection?.saveData) || cpuCores <= 2 || (deviceMemory ?? 4) <= 2;

    const updateMotionPreference = () => setEnableMotion(!media.matches && !isLowPowerDevice);
    updateMotionPreference();
    media.addEventListener("change", updateMotionPreference);

    return () => media.removeEventListener("change", updateMotionPreference);
  }, []);

  return (
    <>
      <BrandIntro mode="once-per-session" />
      <RouteProgress />
      <AppShell>
        <Sidebar />
        <main id="main-content" className="flex-1">
          <Topbar title={title} />
          <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:space-y-6 md:p-6">
            <div key={pathname} className={enableMotion ? "motion-route-transition" : undefined}>
              {children}
            </div>
          </div>
        </main>
        <BottomTabs />
      </AppShell>
      <style jsx global>{`
        @keyframes route-fade-y-enter {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .motion-route-transition {
          animation: route-fade-y-enter 240ms ease-out both;
          will-change: opacity, transform;
        }
      `}</style>
    </>
  );
}

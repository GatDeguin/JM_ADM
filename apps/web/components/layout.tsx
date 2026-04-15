"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { AppShell } from "./ui/AppShell";
import { Sidebar } from "./ui/Sidebar";
import { BottomTabs } from "./ui/BottomTabs";
import { Topbar } from "./ui/Topbar";
import { BrandIntro } from "./ui/BrandIntro";
import { RouteProgress } from "./ui/RouteProgress";

type RouteTransitionPreset = "soft-fade" | "elevate-in" | "section-slide";

type LayoutProps = {
  title: string;
  children: React.ReactNode;
  transitionPreset?: RouteTransitionPreset;
};

const EXIT_DURATION_MS = 210;

export function Layout({ title, children, transitionPreset = "soft-fade" }: LayoutProps) {
  const pathname = usePathname();
  const [enableMotion, setEnableMotion] = useState(false);
  const [activeContent, setActiveContent] = useState(children);
  const [outgoingContent, setOutgoingContent] = useState<React.ReactNode | null>(null);
  const activeContentRef = useRef(children);
  const previousPathRef = useRef(pathname);

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

  useEffect(() => {
    activeContentRef.current = activeContent;
  }, [activeContent]);

  useEffect(() => {
    const pathChanged = previousPathRef.current !== pathname;

    if (!pathChanged) {
      setActiveContent(children);
      return;
    }

    previousPathRef.current = pathname;
    if (!enableMotion) {
      setOutgoingContent(null);
      setActiveContent(children);
      return;
    }

    setOutgoingContent(activeContentRef.current);
    setActiveContent(children);
    const timer = window.setTimeout(() => setOutgoingContent(null), EXIT_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [children, enableMotion, pathname]);

  return (
    <>
      <BrandIntro mode="once-per-session" />
      <RouteProgress />
      <AppShell>
        <Sidebar />
        <main id="main-content" className="flex-1">
          <Topbar title={title} />
          <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:space-y-6 md:p-6">
            <div className="motion-route-stack">
              {enableMotion && outgoingContent ? (
                <div className={`motion-route-layer motion-route-exit motion-route-${transitionPreset}`} aria-hidden="true">
                  {outgoingContent}
                </div>
              ) : null}
              <div
                key={pathname}
                className={enableMotion ? `motion-route-layer motion-route-enter motion-route-${transitionPreset}` : undefined}
              >
                {activeContent}
              </div>
            </div>
          </div>
        </main>
        <BottomTabs />
      </AppShell>
    </>
  );
}

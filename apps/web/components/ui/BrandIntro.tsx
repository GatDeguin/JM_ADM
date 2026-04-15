"use client";

import { useEffect, useState } from "react";

type BrandIntroMode = "always" | "once-per-session" | "once-ever";

const STORAGE_VERSION = "v2";
const STORAGE_KEY = `jm-adm.brand-intro.seen.${STORAGE_VERSION}`;

function getReducedMotionPreference() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getStorage(mode: BrandIntroMode) {
  if (mode === "once-ever") return window.localStorage;
  if (mode === "once-per-session") return window.sessionStorage;
  return null;
}

export function BrandIntro({ mode = "once-per-session" }: { mode?: BrandIntroMode }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // "Ingreso" se define como el inicio de una sesión de pestaña (new tab)
    // o una recarga completa del documento. En ambos casos este efecto se evalúa nuevamente.
    const storage = getStorage(mode);
    const alreadySeen = storage?.getItem(STORAGE_KEY) === "true";

    if (alreadySeen) return;

    if (getReducedMotionPreference()) {
      storage?.setItem(STORAGE_KEY, "true");
      return;
    }

    setIsVisible(true);

    const hideTimer = window.setTimeout(() => {
      setIsVisible(false);
      storage?.setItem(STORAGE_KEY, "true");
    }, 1800);

    return () => {
      window.clearTimeout(hideTimer);
    };
  }, [mode]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-gradient-to-br from-cyan-400/20 via-fuchsia-400/20 to-violet-600/25 p-6 backdrop-blur-md">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/30 bg-white/45 px-8 py-10 text-center shadow-2xl shadow-violet-900/20 animate-[brand-intro_900ms_cubic-bezier(0.2,0.65,0.2,1)_forwards] dark:border-zinc-700/60 dark:bg-zinc-900/55">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 text-lg font-bold text-white shadow-lg shadow-violet-900/30">
          JM
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-600 dark:text-zinc-300">Bienvenido</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">JM ADM</h2>
        </div>
      </div>
    </div>
  );
}

export type { BrandIntroMode };

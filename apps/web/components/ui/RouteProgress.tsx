"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type RouteProgressState = "idle" | "loading" | "settling";

const SHOW_DELAY_MS = 120;
const SETTLING_MS = 480;
const SLOW_CONNECTION_MS = 1800;

export function RouteProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<RouteProgressState>("idle");
  const [isVisible, setIsVisible] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [navToken, setNavToken] = useState(0);

  const lastPathRef = useRef(pathname);
  const stateRef = useRef<RouteProgressState>("idle");

  const showDelayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settlingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = (timerRef: { current: ReturnType<typeof setTimeout> | null }) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const beginLoading = useCallback(() => {
    if (stateRef.current === "loading") {
      return;
    }

    clearTimer(settlingTimer);
    clearTimer(showDelayTimer);
    clearTimer(slowTimer);

    stateRef.current = "loading";
    setState("loading");
    setIsVisible(false);
    setIsSlow(false);

    showDelayTimer.current = setTimeout(() => {
      if (stateRef.current === "loading") {
        setIsVisible(true);
      }
    }, SHOW_DELAY_MS);

    slowTimer.current = setTimeout(() => {
      if (stateRef.current === "loading") {
        setIsSlow(true);
      }
    }, SLOW_CONNECTION_MS);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReduceMotion(media.matches);

    updatePreference();
    media.addEventListener("change", updatePreference);

    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;

      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) {
        return;
      }

      const nextPath = `${destination.pathname}${destination.search}`;
      const currentPath = `${window.location.pathname}${window.location.search}`;
      if (nextPath === currentPath) {
        return;
      }

      beginLoading();
      setNavToken((prev) => prev + 1);
    };

    const handleHistoryIntent = () => {
      beginLoading();
      setNavToken((prev) => prev + 1);
    };

    window.addEventListener("popstate", handleHistoryIntent);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("popstate", handleHistoryIntent);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [beginLoading]);

  useEffect(() => {
    if (pathname === lastPathRef.current) {
      return;
    }

    lastPathRef.current = pathname;

    if (stateRef.current !== "loading") {
      return;
    }

    clearTimer(showDelayTimer);
    clearTimer(slowTimer);

    stateRef.current = "settling";
    setState("settling");
    setIsVisible(true);
    setIsSlow(false);

    settlingTimer.current = setTimeout(() => {
      stateRef.current = "idle";
      setState("idle");
      setIsVisible(false);
    }, SETTLING_MS);
  }, [pathname, navToken]);

  useEffect(
    () => () => {
      clearTimer(showDelayTimer);
      clearTimer(settlingTimer);
      clearTimer(slowTimer);
    },
    [],
  );

  const className = useMemo(() => {
    const classes = ["route-progress", `route-progress--${state}`];

    if (isVisible) {
      classes.push("route-progress--visible");
    }

    if (isSlow) {
      classes.push("route-progress--slow");
    }

    if (reduceMotion) {
      classes.push("route-progress--reduce-motion");
    }

    return classes.join(" ");
  }, [isSlow, isVisible, reduceMotion, state]);

  return (
    <>
      <div aria-hidden="true" className={className} />
      <style jsx>{`
        .route-progress {
          position: fixed;
          inset: 0 auto auto 0;
          z-index: 90;
          width: 100%;
          height: 2px;
          opacity: 0;
          transform-origin: 0 50%;
          transform: scaleX(0.06);
          transition:
            opacity 220ms cubic-bezier(0.2, 0.85, 0.2, 1),
            transform 520ms cubic-bezier(0.2, 0.9, 0.2, 1);
          pointer-events: none;
          background: linear-gradient(90deg, #22d3ee 0%, #3b82f6 35%, #6366f1 68%, #a855f7 100%);
          box-shadow:
            0 0 10px rgba(59, 130, 246, 0.45),
            0 0 20px rgba(56, 189, 248, 0.2);
        }

        .route-progress--visible {
          opacity: 1;
        }

        .route-progress--loading {
          transform: scaleX(0.72);
          transition:
            opacity 140ms ease,
            transform 920ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .route-progress--loading.route-progress--slow {
          transform: scaleX(0.9);
        }

        .route-progress--settling {
          transform: scaleX(1);
          transition:
            opacity 160ms ease,
            transform 460ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .route-progress--idle {
          opacity: 0;
          transform: scaleX(1);
          transition:
            opacity 260ms ease,
            transform 260ms ease;
        }

        .route-progress--reduce-motion {
          transition: opacity 120ms linear;
          transform: scaleX(1);
        }

        .route-progress--reduce-motion.route-progress--loading,
        .route-progress--reduce-motion.route-progress--settling,
        .route-progress--reduce-motion.route-progress--idle {
          transform: scaleX(1);
        }
      `}</style>
    </>
  );
}

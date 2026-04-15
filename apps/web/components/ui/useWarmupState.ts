"use client";

import { useEffect, useRef, useState } from "react";

type LoadingPhase = "idle" | "warming-up" | "loading";

type UseWarmupStateOptions = {
  warmupMs?: number;
};

export function useWarmupState(isLoading: boolean, { warmupMs = 180 }: UseWarmupStateOptions = {}) {
  const [phase, setPhase] = useState<LoadingPhase>("idle");
  const warmupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoading) {
      setPhase("warming-up");
      warmupTimerRef.current = setTimeout(() => {
        setPhase("loading");
        warmupTimerRef.current = null;
      }, warmupMs);
      return;
    }

    if (warmupTimerRef.current) {
      clearTimeout(warmupTimerRef.current);
      warmupTimerRef.current = null;
    }
    setPhase("idle");
  }, [isLoading, warmupMs]);

  useEffect(
    () => () => {
      if (warmupTimerRef.current) {
        clearTimeout(warmupTimerRef.current);
      }
    },
    []
  );

  return phase;
}

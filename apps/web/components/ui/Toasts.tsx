"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type ToastTone = "success" | "error" | "info";

type ToastAction = {
  label: string;
  onClick: () => void;
};

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
  action?: ToastAction;
};

type ToastItem = Omit<ToastInput, "tone"> & {
  id: string;
  tone: ToastTone;
  durationMs: number;
  visible: boolean;
  closing: boolean;
};

type ToastContextValue = {
  pushToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_VISIBLE_TOASTS = 4;
const EXIT_ANIMATION_MS = 220;

const toneStyles: Record<ToastTone, string> = {
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900/70 dark:bg-emerald-950/60 dark:text-emerald-200",
  error: "border-red-300 bg-red-50 text-red-900 dark:border-red-900/70 dark:bg-red-950/60 dark:text-red-200",
  info: "border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const closeTimersRef = useRef<Record<string, number>>({});
  const removeTimersRef = useRef<Record<string, number>>({});

  const clearTimers = useCallback((id: string) => {
    if (closeTimersRef.current[id]) {
      window.clearTimeout(closeTimersRef.current[id]);
      delete closeTimersRef.current[id];
    }
    if (removeTimersRef.current[id]) {
      window.clearTimeout(removeTimersRef.current[id]);
      delete removeTimersRef.current[id];
    }
  }, []);

  const removeToast = useCallback(
    (id: string) => {
      clearTimers(id);
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    },
    [clearTimers]
  );

  const beginCloseToast = useCallback(
    (id: string) => {
      setToasts((prev) =>
        prev.map((toast) => {
          if (toast.id !== id || toast.closing) {
            return toast;
          }
          return { ...toast, closing: true, visible: false };
        })
      );

      if (!removeTimersRef.current[id]) {
        removeTimersRef.current[id] = window.setTimeout(() => removeToast(id), EXIT_ANIMATION_MS);
      }
    },
    [removeToast]
  );

  const pushToast = useCallback(
    ({ durationMs = 3600, tone = "info", ...payload }: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setToasts((prev) => [...prev, { id, tone, durationMs, visible: false, closing: false, ...payload }]);

      window.requestAnimationFrame(() => {
        setToasts((prev) => prev.map((toast) => (toast.id === id ? { ...toast, visible: true } : toast)));
      });

      closeTimersRef.current[id] = window.setTimeout(() => beginCloseToast(id), durationMs);
    },
    [beginCloseToast]
  );

  useEffect(
    () => () => {
      Object.values(closeTimersRef.current).forEach((timer) => window.clearTimeout(timer));
      Object.values(removeTimersRef.current).forEach((timer) => window.clearTimeout(timer));
    },
    []
  );

  const value = useMemo(() => ({ pushToast }), [pushToast]);
  const visibleToasts = toasts.slice(-MAX_VISIBLE_TOASTS);
  const hiddenCount = Math.max(0, toasts.length - visibleToasts.length);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <section
        aria-label="Notificaciones"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col gap-2 px-4 md:inset-x-auto md:bottom-4 md:right-4 md:w-[min(28rem,92vw)]"
      >
        {hiddenCount > 0 ? (
          <p className="self-end rounded-full bg-zinc-900/85 px-3 py-1 text-xs font-medium text-white shadow-md backdrop-blur dark:bg-zinc-100/90 dark:text-zinc-900">
            +{hiddenCount} notificaciones más
          </p>
        ) : null}

        {visibleToasts.map((toast, index) => {
          const depth = visibleToasts.length - index - 1;

          return (
            <article
              key={toast.id}
              style={{
                transform: toast.visible ? `translateY(0) scale(${1 - depth * 0.012})` : "translateY(10px) scale(0.98)",
                opacity: toast.visible ? 1 : 0
              }}
              className={`pointer-events-auto relative overflow-hidden rounded-xl border p-3 shadow-lg backdrop-blur transition-all duration-200 ease-out motion-overlay motion-reduce:transform-none motion-reduce:transition-none ${toneStyles[toast.tone]}`}
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.description ? <p className="mt-1 text-xs opacity-90">{toast.description}</p> : null}
                </div>
                <div className="flex items-center gap-1">
                  {toast.action ? (
                    <button
                      type="button"
                      onClick={() => {
                        toast.action?.onClick();
                        beginCloseToast(toast.id);
                      }}
                      className="rounded-md px-2 py-1 text-xs font-semibold transition-colors motion-hover hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 dark:hover:bg-white/10 dark:focus-visible:ring-zinc-100"
                    >
                      {toast.action.label}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => beginCloseToast(toast.id)}
                    className="rounded-md px-2 py-1 text-xs font-medium transition-colors motion-hover hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 dark:hover:bg-white/10 dark:focus-visible:ring-zinc-100"
                    aria-label="Cerrar notificación"
                  >
                    Cerrar
                  </button>
                </div>
              </div>

              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
                <div
                  className="h-full origin-left bg-current/50 transition-transform ease-linear motion-reduce:transition-none"
                  style={{
                    transform: toast.visible && !toast.closing ? "scaleX(0)" : "scaleX(1)",
                    transitionDuration: `${toast.durationMs}ms`
                  }}
                />
              </div>
            </article>
          );
        })}
      </section>
    </ToastContext.Provider>
  );
}

export function useToasts() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToasts debe usarse dentro de ToastProvider");
  }
  return context;
}

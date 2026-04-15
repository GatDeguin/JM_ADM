"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastTone = "success" | "error" | "info";

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastItem = ToastInput & {
  id: string;
};

type ToastContextValue = {
  pushToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, string> = {
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900/70 dark:bg-emerald-950/60 dark:text-emerald-200",
  error: "border-red-300 bg-red-50 text-red-900 dark:border-red-900/70 dark:bg-red-950/60 dark:text-red-200",
  info: "border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ durationMs = 3600, tone = "info", ...payload }: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, tone, ...payload }]);
      window.setTimeout(() => removeToast(id), durationMs);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <section
        aria-label="Notificaciones"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col gap-2 px-4 md:inset-x-auto md:bottom-4 md:right-4 md:w-[min(28rem,92vw)]"
      >
        {toasts.map((toast) => (
          <article
            key={toast.id}
            className={`pointer-events-auto rounded-xl border p-3 shadow-lg backdrop-blur transition-all motion-overlay ${toneStyles[toast.tone ?? "info"]}`}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? <p className="mt-1 text-xs opacity-90">{toast.description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded-md px-2 py-1 text-xs font-medium transition-colors motion-hover hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 dark:hover:bg-white/10 dark:focus-visible:ring-zinc-100"
                aria-label="Cerrar notificación"
              >
                Cerrar
              </button>
            </div>
          </article>
        ))}
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

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ORIGIN_AUDIT_ERROR_EVENT } from "@/components/workflows/api";

type ToastTone = "success" | "error" | "info" | "processing";

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
  anchorId?: string;
  groupKey?: string;
  critical?: boolean;
};

type ToastItem = Omit<ToastInput, "tone"> & {
  id: string;
  tone: ToastTone;
  durationMs: number;
  visible: boolean;
  closing: boolean;
  count: number;
  fingerprint: string;
};

type CriticalEvent = {
  id: string;
  title: string;
  tone: ToastTone;
  count: number;
  fingerprint: string;
};

type ToastContextValue = {
  pushToast: (toast: ToastInput) => void;
  beginCloseToast: (id: string) => void;
  getToastsByAnchor: (anchorId: string) => ToastItem[];
};

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_VISIBLE_TOASTS = 4;
const MAX_CRITICAL_RAIL_EVENTS = 6;
const EXIT_ANIMATION_MS = 280;

const toneStyles: Record<ToastTone, string> = {
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900/70 dark:bg-emerald-950/60 dark:text-emerald-200",
  error: "border-red-300 bg-red-50 text-red-900 dark:border-red-900/70 dark:bg-red-950/60 dark:text-red-200",
  info: "border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
  processing:
    "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-900/70 dark:bg-sky-950/60 dark:text-sky-200"
};

function buildFingerprint(toast: Pick<ToastInput, "title" | "description" | "tone" | "anchorId" | "groupKey">) {
  if (toast.groupKey) {
    return `${toast.anchorId ?? "global"}:${toast.groupKey}`;
  }
  return `${toast.anchorId ?? "global"}:${toast.tone ?? "info"}:${toast.title.trim().toLowerCase()}:${(toast.description ?? "").trim().toLowerCase()}`;
}

function ToastViewport({
  toasts,
  beginCloseToast,
  className
}: {
  toasts: ToastItem[];
  beginCloseToast: (id: string) => void;
  className: string;
}) {
  const visibleToasts = toasts.slice(-MAX_VISIBLE_TOASTS);
  const hiddenCount = Math.max(0, toasts.length - visibleToasts.length);

  return (
    <section aria-label="Notificaciones" aria-live="polite" className={className}>
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
              opacity: toast.visible ? 1 : 0,
              filter: toast.visible ? "blur(0px)" : "blur(7px)"
            }}
            className={`pointer-events-auto relative overflow-hidden rounded-xl border p-3 shadow-lg backdrop-blur transition-all duration-300 ease-out motion-overlay motion-reduce:transform-none motion-reduce:transition-none ${toneStyles[toast.tone]}`}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {toast.title}
                  {toast.count > 1 ? <span className="ml-2 text-xs font-semibold opacity-70">x{toast.count}</span> : null}
                </p>
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
              {toast.tone === "processing" ? (
                <div className="h-full w-1/3 animate-[processing-indeterminate_1.2s_linear_infinite] rounded-full bg-current/60" />
              ) : (
                <div
                  className="h-full origin-left bg-current/50 transition-transform ease-linear motion-reduce:transition-none"
                  style={{
                    transform: toast.visible && !toast.closing ? "scaleX(0)" : "scaleX(1)",
                    transitionDuration: `${toast.durationMs}ms`
                  }}
                />
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [criticalEvents, setCriticalEvents] = useState<CriticalEvent[]>([]);
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

  const scheduleAutoclose = useCallback(
    (id: string, durationMs: number) => {
      if (durationMs <= 0) return;
      if (closeTimersRef.current[id]) {
        window.clearTimeout(closeTimersRef.current[id]);
      }
      closeTimersRef.current[id] = window.setTimeout(() => beginCloseToast(id), durationMs);
    },
    [beginCloseToast]
  );

  const pushToast = useCallback(
    ({ durationMs, tone = "info", critical, ...payload }: ToastInput) => {
      const resolvedDuration = durationMs ?? (tone === "processing" ? 10000 : 3600);
      const fingerprint = buildFingerprint({ ...payload, tone });

      let targetId: string | null = null;
      setToasts((prev) => {
        const existing = prev.find((toast) => toast.fingerprint === fingerprint && !toast.closing);
        if (existing) {
          targetId = existing.id;
          return prev.map((toast) =>
            toast.id === existing.id
              ? {
                  ...toast,
                  count: toast.count + 1,
                  description: payload.description ?? toast.description,
                  visible: true,
                  closing: false,
                  durationMs: resolvedDuration,
                  action: payload.action ?? toast.action
                }
              : toast
          );
        }

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        targetId = id;
        return [...prev, { id, tone, durationMs: resolvedDuration, visible: false, closing: false, count: 1, fingerprint, ...payload }];
      });

      window.requestAnimationFrame(() => {
        if (!targetId) return;
        setToasts((prev) => prev.map((toast) => (toast.id === targetId ? { ...toast, visible: true } : toast)));
      });

      if (targetId) {
        scheduleAutoclose(targetId, resolvedDuration);
      }

      if (critical || tone === "error") {
        setCriticalEvents((prev) => {
          const existing = prev.find((event) => event.fingerprint === fingerprint);
          if (existing) {
            return prev.map((event) =>
              event.id === existing.id
                ? {
                    ...event,
                    count: event.count + 1,
                    title: payload.title
                  }
                : event
            );
          }

          const next = [
            {
              id: `${Date.now()}-critical-${Math.random().toString(36).slice(2, 8)}`,
              title: payload.title,
              tone,
              count: 1,
              fingerprint
            },
            ...prev
          ];
          return next.slice(0, MAX_CRITICAL_RAIL_EVENTS);
        });
      }
    },
    [scheduleAutoclose]
  );

  useEffect(() => {
    const onAuditError = () => {
      pushToast({
        title: "No se pudo registrar auditoría contextual",
        description: "La operación principal se completó, pero la trazabilidad quedó pendiente.",
        tone: "error",
        groupKey: "origin-audit-error",
      });
    };

    window.addEventListener(ORIGIN_AUDIT_ERROR_EVENT, onAuditError);
    return () => window.removeEventListener(ORIGIN_AUDIT_ERROR_EVENT, onAuditError);
  }, [pushToast]);

  const getToastsByAnchor = useCallback(
    (anchorId: string) => toasts.filter((toast) => toast.anchorId === anchorId),
    [toasts]
  );

  useEffect(
    () => () => {
      Object.values(closeTimersRef.current).forEach((timer) => window.clearTimeout(timer));
      Object.values(removeTimersRef.current).forEach((timer) => window.clearTimeout(timer));
    },
    []
  );

  const value = useMemo(() => ({ pushToast, beginCloseToast, getToastsByAnchor }), [beginCloseToast, getToastsByAnchor, pushToast]);
  const globalToasts = toasts.filter((toast) => !toast.anchorId);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {criticalEvents.length > 0 ? (
        <aside className="pointer-events-none fixed right-4 top-4 z-[80] hidden w-[min(22rem,88vw)] flex-col gap-2 md:flex" aria-label="Estado crítico">
          {criticalEvents.map((event) => (
            <div
              key={event.id}
              className={`pointer-events-auto rounded-lg border px-3 py-2 text-xs shadow-md backdrop-blur ${event.tone === "error" ? "border-red-300/80 bg-red-50/90 text-red-800 dark:border-red-900/80 dark:bg-red-950/70 dark:text-red-200" : "border-sky-300/80 bg-sky-50/90 text-sky-900 dark:border-sky-900/80 dark:bg-sky-950/70 dark:text-sky-200"}`}
            >
              <p className="font-semibold">{event.title}</p>
              <p className="mt-0.5 opacity-80">{event.count > 1 ? `${event.count} eventos similares agrupados` : "Evento crítico en seguimiento"}</p>
            </div>
          ))}
        </aside>
      ) : null}

      <ToastViewport
        toasts={globalToasts}
        beginCloseToast={beginCloseToast}
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col gap-2 px-4 md:inset-x-auto md:bottom-4 md:right-4 md:w-[min(28rem,92vw)]"
      />
    </ToastContext.Provider>
  );
}

export function ToastAnchor({ anchorId, className = "" }: { anchorId: string; className?: string }) {
  const { beginCloseToast, getToastsByAnchor } = useToasts();
  const anchorToasts = getToastsByAnchor(anchorId);

  if (!anchorToasts.length) {
    return null;
  }

  return (
    <ToastViewport
      toasts={anchorToasts}
      beginCloseToast={beginCloseToast}
      className={`pointer-events-none absolute right-2 top-2 z-20 flex w-[min(24rem,96%)] flex-col gap-2 ${className}`}
    />
  );
}

export function useToasts() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToasts debe usarse dentro de ToastProvider");
  }
  return context;
}

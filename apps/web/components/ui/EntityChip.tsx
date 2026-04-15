"use client";

import type { ReactNode } from "react";

export type EntityChipTone = "neutral" | "success" | "warning" | "danger" | "info";

export type EntityChipProps = {
  label: string;
  subtitle?: string;
  tone?: EntityChipTone;
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onRemove?: () => void;
  className?: string;
};

const toneStyles: Record<EntityChipTone, string> = {
  neutral: "border-zinc-300 bg-zinc-50 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100",
  success: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200",
  warning: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-200",
  danger: "border-red-300 bg-red-50 text-red-900 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200",
  info: "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-200"
};

export function EntityChip({ label, subtitle, tone = "neutral", icon, disabled, loading, onRemove, className }: EntityChipProps) {
  const isInteractive = Boolean(onRemove) && !disabled;

  return (
    <span
      className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${toneStyles[tone]} ${disabled ? "opacity-60" : ""} ${className ?? ""}`}
      aria-disabled={disabled}
    >
      {loading ? <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : icon}
      <span className="leading-tight">
        <span className="block font-medium">{label}</span>
        {subtitle ? <span className="block text-xs opacity-80">{subtitle}</span> : null}
      </span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          disabled={!isInteractive}
          className="ml-1 rounded-full p-1 text-xs transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 dark:hover:bg-white/10 dark:focus-visible:ring-zinc-100"
          aria-label={`Quitar ${label}`}
        >
          ✕
        </button>
      ) : null}
    </span>
  );
}

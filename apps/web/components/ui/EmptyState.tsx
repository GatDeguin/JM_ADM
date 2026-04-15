"use client";

import type { ReactNode } from "react";

type EmptyStateAction = {
  label: string;
  onClick: () => void;
};

type EmptyStateProps = {
  icon?: ReactNode;
  title?: string;
  subtitle?: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
};

const defaultIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" d="M8 10h8M8 14h5" />
  </svg>
);

export function EmptyState({
  icon = defaultIcon,
  title = "Sin datos",
  subtitle = "No se encontraron registros para esta vista.",
  primaryAction,
  secondaryAction
}: EmptyStateProps) {
  return (
    <div
      className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900/30"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
          {icon}
        </span>
        <div className="flex-1">
          <p className="font-medium text-zinc-800 dark:text-zinc-100">{title}</p>
          <p className="mt-1 text-zinc-600 dark:text-zinc-300">{subtitle}</p>
          {primaryAction || secondaryAction ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {primaryAction ? (
                <button type="button" className="btn-primary" onClick={primaryAction.onClick}>
                  {primaryAction.label}
                </button>
              ) : null}
              {secondaryAction ? (
                <button type="button" className="btn-secondary" onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

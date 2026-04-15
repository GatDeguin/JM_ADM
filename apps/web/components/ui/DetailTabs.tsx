"use client";

import type { ReactNode } from "react";
import { useId, useState } from "react";

export type DetailTabItem = {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
  error?: string;
};

export type DetailTabsProps = {
  tabs: DetailTabItem[];
  defaultTabId?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (tabId: string) => void;
};

export function DetailTabs({ tabs, defaultTabId, loading, disabled, className, onChange }: DetailTabsProps) {
  const fallbackId = tabs.find((tab) => !tab.disabled)?.id ?? tabs[0]?.id;
  const [activeTab, setActiveTab] = useState(defaultTabId ?? fallbackId);
  const rootId = useId();

  if (!tabs.length || !activeTab) return null;

  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === activeTab));
  const current = tabs[activeIndex] ?? tabs[0];

  const focusTab = (index: number) => {
    const tab = tabs[index];
    if (!tab || tab.disabled || disabled) return;
    setActiveTab(tab.id);
    onChange?.(tab.id);
  };

  return (
    <section className={`card-base ${className ?? ""}`}>
      <div
        role="tablist"
        aria-label="Detalle"
        className="flex flex-wrap gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            focusTab((activeIndex + 1) % tabs.length);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            focusTab((activeIndex - 1 + tabs.length) % tabs.length);
          }
          if (event.key === "Home") {
            event.preventDefault();
            focusTab(0);
          }
          if (event.key === "End") {
            event.preventDefault();
            focusTab(tabs.length - 1);
          }
        }}
      >
        {tabs.map((tab) => {
          const selected = tab.id === current.id;
          return (
            <button
              key={tab.id}
              id={`${rootId}-tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${rootId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              disabled={disabled || tab.disabled}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                selected ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              } disabled:opacity-50`}
              onClick={() => focusTab(tabs.findIndex((item) => item.id === tab.id))}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        id={`${rootId}-panel-${current.id}`}
        role="tabpanel"
        aria-labelledby={`${rootId}-tab-${current.id}`}
        className="pt-4"
      >
        {loading ? <p className="text-sm text-zinc-500">Cargando...</p> : null}
        {current.error ? <p className="mb-2 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{current.error}</p> : null}
        {!loading ? current.content : null}
      </div>
    </section>
  );
}

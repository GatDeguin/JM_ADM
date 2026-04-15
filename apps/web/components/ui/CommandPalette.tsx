"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export type CommandItem = {
  id: string;
  title: string;
  subtitle?: string;
  keywords?: string[];
  disabled?: boolean;
  onSelect: () => void;
};

export type CommandPaletteProps = {
  open: boolean;
  commands: CommandItem[];
  loading?: boolean;
  error?: string | null;
  disabled?: boolean;
  onClose: () => void;
  placeholder?: string;
  emptyLabel?: string;
};

export function CommandPalette({
  open,
  commands,
  loading,
  error,
  disabled,
  onClose,
  placeholder = "Buscar acción...",
  emptyLabel = "Sin resultados"
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const titleId = useId();

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return commands;
    return commands.filter((cmd) => {
      const bag = `${cmd.title} ${cmd.subtitle ?? ""} ${(cmd.keywords ?? []).join(" ")}`.toLowerCase();
      return bag.includes(normalized);
    });
  }, [commands, query]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    setQuery("");
    setActiveIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const selectIndex = (idx: number) => {
    const cmd = filtered[idx];
    if (!cmd || cmd.disabled || disabled) return;
    cmd.onSelect();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[10vh]" role="presentation">
      <button type="button" aria-label="Cerrar palette" className="absolute inset-0 cursor-default" onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 id={titleId} className="sr-only">
          Command palette
        </h2>
        <label htmlFor={`${titleId}-query`} className="sr-only">
          Buscar comandos
        </label>
        <input
          ref={inputRef}
          id={`${titleId}-query`}
          className="input-base w-full"
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((prev) => Math.min(prev + 1, Math.max(0, filtered.length - 1)));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((prev) => Math.max(0, prev - 1));
            }
            if (event.key === "Enter") {
              event.preventDefault();
              selectIndex(activeIndex);
            }
          }}
          aria-controls={`${titleId}-results`}
        />

        <div id={`${titleId}-results`} role="listbox" className="mt-3 max-h-[50vh] space-y-1 overflow-y-auto" aria-label="Resultados">
          {error ? <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {loading ? <p className="px-3 py-2 text-sm text-zinc-500">Cargando...</p> : null}
          {!loading && !filtered.length ? <p className="px-3 py-2 text-sm text-zinc-500">{emptyLabel}</p> : null}

          {filtered.map((cmd, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={cmd.id}
                type="button"
                role="option"
                aria-selected={active}
                disabled={cmd.disabled || disabled}
                className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                  active ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-800" : "border-transparent hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                } disabled:opacity-50`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => selectIndex(idx)}
              >
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{cmd.title}</p>
                {cmd.subtitle ? <p className="text-xs text-zinc-500 dark:text-zinc-400">{cmd.subtitle}</p> : null}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

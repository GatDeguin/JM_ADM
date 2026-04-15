"use client";

import { useMemo, useState } from "react";

const states = ["all", "active", "draft", "blocked"] as const;

export function FilterBar() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof states)[number]>("all");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "success">("idle");

  const validation = useMemo(() => {
    if (!query.trim()) return "Ingresá un término para refinar la búsqueda.";
    if (query.trim().length < 2) return "Usá al menos 2 caracteres para activar el filtro.";
    return null;
  }, [query]);

  const applyFilters = async () => {
    if (validation) return;
    setSaveState("saving");
    await new Promise((resolve) => setTimeout(resolve, 350));
    setSaveState("success");
    setTimeout(() => setSaveState("idle"), 1200);
  };

  return (
    <section className="card-base space-y-3">
      <div className="grid gap-3 md:grid-cols-[2fr_1fr_auto] md:items-end">
        <label htmlFor="filter-query">
          <span className="mb-1 block text-sm font-medium">Buscar</span>
          <input
            id="filter-query"
            className={`input-base focus-premium w-full ${validation ? "border-amber-300" : ""}`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cliente, código o referencia"
          />
          {validation ? <p className="mt-1 text-sm text-amber-700 animate-inline-status">{validation}</p> : null}
        </label>

        <label htmlFor="filter-status">
          <span className="mb-1 block text-sm font-medium">Estado</span>
          <select id="filter-status" className="input-base focus-premium w-full" value={status} onChange={(event) => setStatus(event.target.value as (typeof states)[number])}>
            {states.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <button
          className="btn-secondary focus-premium inline-flex items-center justify-center gap-2"
          type="button"
          onClick={applyFilters}
          disabled={Boolean(validation) || saveState === "saving"}
        >
          {saveState === "saving" ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" className="opacity-30" stroke="currentColor" strokeWidth="3" />
                <path d="M12 3a9 9 0 0 1 9 9" className="opacity-100" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Aplicando
            </>
          ) : saveState === "success" ? (
            <span className="animate-inline-status text-emerald-700">✓ Aplicado</span>
          ) : (
            "Aplicar"
          )}
        </button>
      </div>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { QuickCreateSheet } from "@/components/ui/QuickCreateSheet";

export type SmartSelectorOption = { id: string; label: string; meta?: string };

type SmartSelectorProps = {
  label: string;
  options: SmartSelectorOption[];
  value?: string;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onChange: (value: string) => void;
  onCreateOption?: (input: { label: string; meta?: string }) => Promise<SmartSelectorOption>;
};

export function SmartSelector({
  label,
  options,
  value,
  loading,
  error,
  emptyMessage = "Sin opciones disponibles.",
  onChange,
  onCreateOption
}: SmartSelectorProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
    [options, query]
  );

  return (
    <div className="rounded-xl border bg-white p-3">
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <input
        className="mb-2 w-full rounded border px-3 py-2 text-sm"
        placeholder="Buscar opción"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading ? <p className="text-xs text-zinc-500">Cargando opciones...</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {!loading && !error && filtered.length === 0 ? <p className="text-xs text-zinc-500">{emptyMessage}</p> : null}
      <div className="space-y-1">
        {filtered.map((option) => (
          <button
            key={option.id}
            className={`block w-full rounded px-2 py-1.5 text-left text-sm ${value === option.id ? "bg-zinc-900 text-white" : "bg-zinc-100"}`}
            onClick={() => onChange(option.id)}
          >
            <div>{option.label}</div>
            {option.meta ? <div className="text-xs opacity-80">{option.meta}</div> : null}
          </button>
        ))}
      </div>
      {onCreateOption ? (
        <div className="mt-3">
          <QuickCreateSheet<{ label: string; meta: string }>
            title={`Crear desde ${label}`}
            fields={[
              { key: "label", label: "Nombre" },
              { key: "meta", label: "Descripción" }
            ]}
            onCreate={async (payload) => {
              const created = await onCreateOption(payload);
              onChange(created.id);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

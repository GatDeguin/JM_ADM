"use client";

import { useState } from "react";

type Item = { id: string; label: string; saving?: boolean; flash?: "new" | "updated" };

export function InlineCollectionEditor() {
  const [items, setItems] = useState<Item[]>([]);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "success">("idle");

  const persist = async (label: string) => {
    const clean = label.trim();
    if (clean.length < 2) {
      setError("Ingresá al menos 2 caracteres.");
      return;
    }
    setError(null);
    setSaveState("saving");
    await new Promise((resolve) => setTimeout(resolve, 350));

    const existing = items.find((item) => item.label.toLowerCase() === clean.toLowerCase());
    if (existing) {
      setItems((prev) =>
        prev.map((item) => (item.id === existing.id ? { ...item, label: clean, flash: "updated" } : item))
      );
      setTimeout(() => setItems((prev) => prev.map((item) => (item.id === existing.id ? { ...item, flash: undefined } : item))), 1600);
    } else {
      const next: Item = { id: `inline-${Date.now()}`, label: clean, flash: "new" };
      setItems((prev) => [next, ...prev]);
      setTimeout(() => setItems((prev) => prev.map((item) => (item.id === next.id ? { ...item, flash: undefined } : item))), 1600);
    }

    setValue("");
    setSaveState("success");
    setTimeout(() => setSaveState("idle"), 1200);
  };

  return (
    <section className="card-base space-y-3">
      <header>
        <h3 className="text-sm font-semibold">Inline collection</h3>
        <p className="text-xs text-zinc-500">Alta/edición rápida con validación inline.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        <input
          className={`input-base focus-premium flex-1 ${error ? "border-red-300" : ""}`}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Agregar ítem"
          aria-invalid={Boolean(error)}
        />
        <button className="btn-primary focus-premium inline-flex items-center gap-2" type="button" onClick={() => persist(value)} disabled={saveState === "saving"}>
          {saveState === "saving" ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" className="opacity-30" stroke="currentColor" strokeWidth="3" />
                <path d="M12 3a9 9 0 0 1 9 9" className="opacity-100" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Guardando
            </>
          ) : saveState === "success" ? (
            <span className="animate-inline-status">✓ Listo</span>
          ) : (
            "Guardar"
          )}
        </button>
      </div>
      {error ? <p className="text-sm text-red-600 animate-inline-status">{error}</p> : null}

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className={`rounded-lg border px-3 py-2 text-sm motion-state ${
              item.flash === "new"
                ? "animate-row-highlight-new border-emerald-200 bg-emerald-50/70"
                : item.flash === "updated"
                  ? "animate-row-highlight-updated border-sky-200 bg-sky-50/70"
                  : "bg-white"
            }`}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

"use client";

import { useEffect, useId, useState } from "react";

export type QuickCreateSheetProps<T extends Record<string, unknown>> = {
  title: string;
  loading?: boolean;
  error?: string | null;
  originFlow?: string;
  onCreate: (payload: T & { originFlow?: string }) => Promise<void> | void;
  fields: Array<{ key: keyof T; label: string; placeholder?: string }>;
};

export function QuickCreateSheet<T extends Record<string, unknown>>({ title, loading, error, originFlow, onCreate, fields }: QuickCreateSheetProps<T>) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Partial<T>>({});
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const submit = async () => {
    await onCreate({ ...(values as T), originFlow });
    setValues({});
    setOpen(false);
  };

  return (
    <div>
      <button className="btn-secondary w-full sm:w-auto" type="button" onClick={() => setOpen(true)}>
        Crear rápido
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 md:items-stretch md:justify-end" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <button type="button" aria-label="Cerrar panel" className="hidden flex-1 cursor-default md:block" onClick={() => setOpen(false)} />
          <section className="h-[95vh] w-full overflow-y-auto rounded-t-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 md:h-full md:max-w-md md:rounded-none">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 id={titleId} className="text-lg font-semibold">
                {title}
              </h3>
              <button className="btn-secondary" type="button" onClick={() => setOpen(false)}>
                Cerrar
              </button>
            </div>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              {fields.map((field) => {
                const fieldId = `${titleId}-${String(field.key)}`;
                return (
                  <label key={String(field.key)} className="block" htmlFor={fieldId}>
                    <span className="mb-1 block text-sm font-medium">{field.label}</span>
                    <input
                      id={fieldId}
                      className="input-base w-full"
                      placeholder={field.placeholder}
                      value={String(values[field.key] ?? "")}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          [field.key]: e.target.value
                        }))
                      }
                    />
                  </label>
                );
              })}
              {error ? <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200">{error}</p> : null}
              <button className="btn-primary w-full" type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}

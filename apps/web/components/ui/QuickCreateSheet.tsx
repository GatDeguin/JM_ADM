"use client";

import { useState } from "react";

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

  const submit = async () => {
    await onCreate({ ...(values as T), originFlow });
    setValues({});
    setOpen(false);
  };

  return (
    <div>
      <button className="btn-primary" onClick={() => setOpen(true)}>
        Crear rápido
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" role="dialog" aria-modal="true" aria-label={title}>
          <div className="h-full w-full bg-white p-4 shadow-xl md:max-w-md">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">{title}</h3>
              <button className="btn-secondary" onClick={() => setOpen(false)}>
                Cerrar
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((field) => (
                <label key={String(field.key)} className="block">
                  <span className="mb-1 block text-sm font-medium">{field.label}</span>
                  <input
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
              ))}
            </div>
            {error ? <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
            <button className="btn-primary mt-4 w-full" disabled={loading} onClick={submit}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

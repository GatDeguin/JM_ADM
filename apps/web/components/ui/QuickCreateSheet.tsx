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
      <button className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white" onClick={() => setOpen(true)}>
        Crear rápido
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full w-full max-w-md bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">{title}</h3>
              <button onClick={() => setOpen(false)}>Cerrar</button>
            </div>
            <div className="space-y-3">
              {fields.map((field) => (
                <label key={String(field.key)} className="block">
                  <span className="mb-1 block text-sm">{field.label}</span>
                  <input
                    className="w-full rounded border px-3 py-2"
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
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
            <button className="mt-4 w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white" disabled={loading} onClick={submit}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

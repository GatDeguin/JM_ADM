"use client";

import { useMemo, useState } from "react";

export type ImportRecord = { id: string; source: string; status: "pending" | "ok" | "error"; summary: string };

type ImportStudioProps = {
  records: ImportRecord[];
  loading?: boolean;
  error?: string | null;
  onRunImport: (source: string) => Promise<void> | void;
  onDeleteRecord?: (id: string) => void;
};

export function ImportStudio({ records, loading, error, onRunImport, onDeleteRecord }: ImportStudioProps) {
  const [source, setSource] = useState("");
  const hasErrors = useMemo(() => records.some((r) => r.status === "error"), [records]);

  return (
    <section className="rounded-xl border bg-white p-4">
      <h3 className="mb-3 font-semibold">Import Studio</h3>
      <div className="mb-4 flex gap-2">
        <input className="flex-1 rounded border px-3 py-2 text-sm" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Fuente (archivo/url)" />
        <button className="rounded bg-zinc-900 px-3 py-2 text-sm text-white" onClick={() => onRunImport(source)}>
          Ejecutar
        </button>
      </div>
      {loading ? <p className="text-sm text-zinc-500">Procesando importación...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {hasErrors ? <p className="mb-2 text-xs text-amber-700">Hay registros con error para revisar.</p> : null}
      {!loading && !error && records.length === 0 ? <p className="text-sm text-zinc-500">Aún no hay ejecuciones.</p> : null}
      <div className="space-y-2">
        {records.map((record) => (
          <article key={record.id} className="rounded border p-2 text-sm">
            <div className="flex items-center justify-between">
              <strong>{record.source}</strong>
              <span className={record.status === "ok" ? "text-emerald-600" : record.status === "error" ? "text-red-600" : "text-zinc-500"}>{record.status}</span>
            </div>
            <p className="text-xs text-zinc-600">{record.summary}</p>
            {onDeleteRecord ? <button className="mt-2 text-xs text-red-700" onClick={() => onDeleteRecord(record.id)}>Eliminar</button> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

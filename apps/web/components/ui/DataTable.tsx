"use client";

import { useMemo, useState, type ReactNode } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeletons } from "@/components/ui/Skeletons";

export type DataTableColumn<T extends Record<string, unknown>> = {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
};

type DataTableProps<T extends Record<string, unknown>> = {
  title?: string;
  columns: Array<DataTableColumn<T>>;
  rows: T[];
  rowId: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  successMessage?: string | null;
  onCreate?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
};

export function DataTable<T extends Record<string, unknown>>({
  title,
  columns,
  rows,
  rowId,
  loading,
  error,
  emptyMessage = "Sin registros para mostrar.",
  successMessage,
  onCreate,
  onEdit,
  onDelete
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query.toLowerCase()));
  }, [query, rows]);

  return (
    <section className="card-base space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold md:text-lg">{title ?? "Registros"}</h3>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <label className="sr-only" htmlFor="table-filter">
            Filtrar en tabla
          </label>
          <input
            id="table-filter"
            className="input-base w-full sm:w-56"
            placeholder="Filtrar en tabla"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {onCreate ? (
            <button className="btn-primary" type="button" onClick={onCreate}>
              Crear
            </button>
          ) : null}
        </div>
      </div>

      {successMessage ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200">
          ✅ {successMessage}
        </p>
      ) : null}
      {loading ? <Skeletons variant="table" rows={4} density="normal" /> : null}
      {!loading && error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-200">Error: {error}</p>
      ) : null}
      {!loading && !error && filtered.length === 0 ? <EmptyState description={emptyMessage} /> : null}

      {!loading && !error && filtered.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800" tabIndex={0} aria-label="Tabla de resultados">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left dark:border-zinc-800 dark:bg-zinc-900/60">
                {columns.map((col) => (
                  <th key={String(col.key)} className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-200">
                    {col.header}
                  </th>
                ))}
                {onEdit || onDelete ? <th className="px-3 py-2 text-zinc-700 dark:text-zinc-200">Acciones</th> : null}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={rowId(row)} className="border-b border-zinc-200 last:border-b-0 dark:border-zinc-800">
                  {columns.map((col) => {
                    const value = row[col.key];
                    return (
                      <td key={String(col.key)} className="px-3 py-2 text-zinc-700 dark:text-zinc-200">
                        {col.render ? col.render(value, row) : String(value ?? "-")}
                      </td>
                    );
                  })}
                  {onEdit || onDelete ? (
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        {onEdit ? (
                          <button className="btn-secondary" type="button" onClick={() => onEdit(row)}>
                            Editar
                          </button>
                        ) : null}
                        {onDelete ? (
                          <button
                            className="rounded-lg border border-red-300 px-2 py-1 text-red-700 hover:bg-red-50 dark:border-red-900/80 dark:text-red-300 dark:hover:bg-red-950/40"
                            type="button"
                            onClick={() => onDelete(row)}
                          >
                            Eliminar
                          </button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

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
    <section className="card-base space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-zinc-900">{title ?? "Registros"}</h3>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="table-filter">Filtrar en tabla</label>
          <input
            id="table-filter"
            className="input-base"
            placeholder="Filtrar en tabla"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {onCreate ? (
            <button className="btn-primary" onClick={onCreate}>
              Crear
            </button>
          ) : null}
        </div>
      </div>

      {successMessage ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">✅ {successMessage}</p> : null}
      {loading ? <Skeletons rows={4} /> : null}
      {!loading && error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Error: {error}</p> : null}
      {!loading && !error && filtered.length === 0 ? <EmptyState description={emptyMessage} /> : null}

      {!loading && !error && filtered.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-zinc-50 text-left">
                {columns.map((col) => (
                  <th key={String(col.key)} className="px-3 py-2 font-medium text-zinc-700">
                    {col.header}
                  </th>
                ))}
                {onEdit || onDelete ? <th className="px-3 py-2">Acciones</th> : null}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={rowId(row)} className="border-b last:border-b-0">
                  {columns.map((col) => {
                    const value = row[col.key];
                    return (
                      <td key={String(col.key)} className="px-3 py-2 text-zinc-700">
                        {col.render ? col.render(value, row) : String(value ?? "-")}
                      </td>
                    );
                  })}
                  {onEdit || onDelete ? (
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        {onEdit ? (
                          <button className="btn-secondary" onClick={() => onEdit(row)}>
                            Editar
                          </button>
                        ) : null}
                        {onDelete ? (
                          <button className="rounded-lg border border-red-200 px-2 py-1 text-red-700" onClick={() => onDelete(row)}>
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

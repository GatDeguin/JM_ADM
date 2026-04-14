"use client";

import { useMemo, useState, type ReactNode } from "react";

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
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-zinc-900">{title ?? "Registros"}</h3>
        <div className="flex items-center gap-2">
          <input
            className="rounded-lg border px-3 py-1.5 text-sm"
            placeholder="Filtrar en tabla"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {onCreate ? (
            <button className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white" onClick={onCreate}>
              Crear
            </button>
          ) : null}
        </div>
      </div>

      {loading ? <p className="text-sm text-zinc-500">Cargando registros...</p> : null}
      {!loading && error ? <p className="text-sm text-red-600">Error: {error}</p> : null}
      {!loading && !error && filtered.length === 0 ? <p className="text-sm text-zinc-500">{emptyMessage}</p> : null}

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
                {(onEdit || onDelete) ? <th className="px-3 py-2">Acciones</th> : null}
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
                  {(onEdit || onDelete) ? (
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        {onEdit ? (
                          <button className="rounded border px-2 py-1" onClick={() => onEdit(row)}>
                            Editar
                          </button>
                        ) : null}
                        {onDelete ? (
                          <button className="rounded border border-red-200 px-2 py-1 text-red-700" onClick={() => onDelete(row)}>
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

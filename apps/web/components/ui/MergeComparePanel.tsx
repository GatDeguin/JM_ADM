"use client";

type MergeComparePanelProps<T extends Record<string, unknown>> = {
  leftLabel: string;
  rightLabel: string;
  left: T | null;
  right: T | null;
  loading?: boolean;
  error?: string | null;
  onMerge: (winner: "left" | "right") => void;
};

export function MergeComparePanel<T extends Record<string, unknown>>({
  leftLabel,
  rightLabel,
  left,
  right,
  loading,
  error,
  onMerge
}: MergeComparePanelProps<T>) {
  if (loading) return <div className="rounded-xl border bg-white p-3 text-sm text-zinc-500">Cargando comparación...</div>;
  if (error) return <div className="rounded-xl border bg-white p-3 text-sm text-red-600">{error}</div>;
  if (!left || !right) return <div className="rounded-xl border bg-white p-3 text-sm text-zinc-500">Selecciona dos registros para comparar.</div>;

  const keys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)]));

  return (
    <section className="rounded-xl border bg-white p-4">
      <h3 className="mb-3 font-semibold">Merge / Homologación</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {[{ label: leftLabel, data: left, side: "left" as const }, { label: rightLabel, data: right, side: "right" as const }].map((col) => (
          <article key={col.side} className="rounded-lg border p-3">
            <header className="mb-2 flex items-center justify-between">
              <strong>{col.label}</strong>
              <button className="rounded bg-zinc-900 px-2 py-1 text-xs text-white" onClick={() => onMerge(col.side)}>
                Conservar este
              </button>
            </header>
            <ul className="space-y-1 text-sm">
              {keys.map((key) => (
                <li key={key}>
                  <span className="font-medium">{key}: </span>
                  <span>{String(col.data[key] ?? "-")}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

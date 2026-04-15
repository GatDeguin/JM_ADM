"use client";

export type DataCard = {
  id: string;
  label: string;
  value: string | number;
  helper?: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};

export type DataCardsProps = {
  title?: string;
  items: DataCard[];
  loading?: boolean;
  disabled?: boolean;
  error?: string | null;
  columns?: 2 | 3 | 4;
};

const toneStyles: Record<NonNullable<DataCard["tone"]>, string> = {
  neutral: "border-zinc-200 dark:border-zinc-800",
  success: "border-emerald-300/70 dark:border-emerald-900/70",
  warning: "border-amber-300/70 dark:border-amber-900/70",
  danger: "border-red-300/70 dark:border-red-900/70"
};

export function DataCards({ title, items, loading, disabled, error, columns = 3 }: DataCardsProps) {
  const columnsClass = columns === 2 ? "md:grid-cols-2" : columns === 4 ? "md:grid-cols-4" : "md:grid-cols-3";

  return (
    <section className="card-base space-y-3" aria-busy={loading}>
      {title ? <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">{title}</h3> : null}
      {error ? <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <div className={`grid gap-3 ${columnsClass}`}>
        {items.map((item) => (
          <article
            key={item.id}
            className={`rounded-xl border bg-white p-3 dark:bg-zinc-900 ${toneStyles[item.tone ?? "neutral"]} ${disabled ? "opacity-50" : ""}`}
          >
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{item.label}</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{loading ? "—" : item.value}</p>
            {item.helper ? <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{item.helper}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

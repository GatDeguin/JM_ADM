"use client";

export function KPIStatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="card-base p-4 md:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{value}</p>
    </article>
  );
}

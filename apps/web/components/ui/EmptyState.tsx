"use client";

export function EmptyState({ title = "Sin datos", description = "No se encontraron registros para esta vista." }: { title?: string; description?: string }) {
  return (
    <div
      className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900/30"
      role="status"
      aria-live="polite"
    >
      <p className="font-medium text-zinc-800 dark:text-zinc-100">{title}</p>
      <p className="mt-1 text-zinc-600 dark:text-zinc-300">{description}</p>
    </div>
  );
}

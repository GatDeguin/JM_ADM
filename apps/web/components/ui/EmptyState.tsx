"use client";

export function EmptyState({ title = "Sin datos", description = "No se encontraron registros para esta vista." }: { title?: string; description?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm" role="status" aria-live="polite">
      <p className="font-medium text-zinc-800">{title}</p>
      <p className="mt-1 text-zinc-600">{description}</p>
    </div>
  );
}

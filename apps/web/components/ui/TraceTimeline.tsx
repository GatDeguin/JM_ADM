"use client";

export type TraceNode = {
  id: string;
  step: string;
  lot: string;
  at: string;
  status: "ok" | "blocked" | "warning";
};

type TraceTimelineProps = {
  nodes: TraceNode[];
  loading?: boolean;
  error?: string | null;
  onInspect?: (nodeId: string) => void;
};

export function TraceTimeline({ nodes, loading, error, onInspect }: TraceTimelineProps) {
  if (loading) return <div className="rounded-xl border bg-white p-3 text-sm text-zinc-500">Cargando trazabilidad...</div>;
  if (error) return <div className="rounded-xl border bg-white p-3 text-sm text-red-600">{error}</div>;
  if (nodes.length === 0) return <div className="rounded-xl border bg-white p-3 text-sm text-zinc-500">Sin hitos de trazabilidad.</div>;

  return (
    <ol className="rounded-xl border bg-white p-4">
      {nodes.map((node) => (
        <li key={node.id} className="mb-3 rounded border p-3 last:mb-0">
          <div className="flex items-center justify-between">
            <strong className="text-sm">{node.step}</strong>
            <span className={node.status === "ok" ? "text-emerald-600" : node.status === "warning" ? "text-amber-600" : "text-red-600"}>{node.status}</span>
          </div>
          <div className="text-xs text-zinc-500">Lote: {node.lot}</div>
          <div className="text-xs text-zinc-500">Fecha: {node.at}</div>
          {onInspect ? <button className="mt-1 text-xs text-indigo-700" onClick={() => onInspect(node.id)}>Inspeccionar</button> : null}
        </li>
      ))}
    </ol>
  );
}

"use client";

export type AuditEvent = {
  id: string;
  action: "create" | "update" | "delete" | "merge" | "homologation";
  user: string;
  at: string;
  detail: string;
};

type AuditTimelineProps = {
  events: AuditEvent[];
  loading?: boolean;
  error?: string | null;
  onRevert?: (eventId: string) => void;
};

export function AuditTimeline({ events, loading, error, onRevert }: AuditTimelineProps) {
  if (loading) return <div className="rounded-xl border bg-white p-3 text-sm text-zinc-500">Cargando auditoría...</div>;
  if (error) return <div className="rounded-xl border bg-white p-3 text-sm text-red-600">{error}</div>;
  if (events.length === 0) return <div className="rounded-xl border bg-white p-3 text-sm text-zinc-500">Sin eventos de auditoría.</div>;

  return (
    <ol className="rounded-xl border bg-white p-4">
      {events.map((event) => (
        <li key={event.id} className="mb-3 border-l-2 border-zinc-200 pl-3 last:mb-0">
          <div className="text-sm font-medium">{event.action.toUpperCase()} · {event.user}</div>
          <div className="text-xs text-zinc-500">{event.at}</div>
          <p className="text-sm text-zinc-700">{event.detail}</p>
          {onRevert ? <button className="mt-1 text-xs text-indigo-700" onClick={() => onRevert(event.id)}>Revertir</button> : null}
        </li>
      ))}
    </ol>
  );
}

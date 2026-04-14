import type { AuditEvent } from "@/components/ui/AuditTimeline";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ApiAuditLog = {
  id: string;
  action: string;
  userId: string | null;
  createdAt: string;
  origin: string | null;
  entity: string;
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
};

async function request(path: string) {
  const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Error consultando auditoría (${response.status})`);
  }
  return (await response.json()) as ApiAuditLog[];
}

function summarize(log: ApiAuditLog) {
  const beforeKeys = Object.keys(log.before ?? {});
  const afterKeys = Object.keys(log.after ?? {});
  if (beforeKeys.length === 0 && afterKeys.length === 0) return `${log.entity}#${log.entityId}`;
  return `${log.entity}#${log.entityId} · before:${beforeKeys.length} after:${afterKeys.length}`;
}

function toAuditEvent(log: ApiAuditLog): AuditEvent {
  return {
    id: log.id,
    action: log.action,
    user: log.userId ?? "system",
    at: new Date(log.createdAt).toLocaleString("es-AR", { hour12: false }),
    detail: summarize(log),
    origin: log.origin ?? undefined,
  };
}

export async function fetchEntityTimeline(entity: string, entityId: string) {
  const rows = await request(`/audit/audit-logs/timeline/${encodeURIComponent(entity)}/${encodeURIComponent(entityId)}?limit=50`);
  return rows.map(toAuditEvent);
}

export async function fetchGlobalAuditFeed() {
  const rows = await request("/audit/audit-logs?limit=100");
  return rows.map(toAuditEvent);
}

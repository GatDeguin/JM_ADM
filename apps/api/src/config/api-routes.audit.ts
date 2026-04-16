import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_AUDIT: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "GET", path: "/audit/audit-logs", summary: "GET /audit/audit-logs" },
  { method: "POST", path: "/audit/audit-logs", summary: "POST /audit/audit-logs" },
  { method: "DELETE", path: "/audit/audit-logs/{id}", summary: "DELETE /audit/audit-logs/{id}" },
  { method: "GET", path: "/audit/audit-logs/{id}", summary: "GET /audit/audit-logs/{id}" },
  { method: "PATCH", path: "/audit/audit-logs/{id}", summary: "PATCH /audit/audit-logs/{id}" },
  { method: "POST", path: "/audit/audit-logs/{id}/action", summary: "POST /audit/audit-logs/{id}/action" },
  { method: "GET", path: "/audit/audit-logs/timeline/{entity}/{entityId}", summary: "GET /audit/audit-logs/timeline/{entity}/{entityId}" },
];

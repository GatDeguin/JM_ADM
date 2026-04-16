import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_QUALITY: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "GET", path: "/quality/checklists/by-batch/{batchId}", summary: "GET /quality/checklists/by-batch/{batchId}" },
  { method: "GET", path: "/quality/qc-records", summary: "GET /quality/qc-records" },
  { method: "POST", path: "/quality/qc-records", summary: "POST /quality/qc-records" },
  { method: "DELETE", path: "/quality/qc-records/{id}", summary: "DELETE /quality/qc-records/{id}" },
  { method: "GET", path: "/quality/qc-records/{id}", summary: "GET /quality/qc-records/{id}" },
  { method: "PATCH", path: "/quality/qc-records/{id}", summary: "PATCH /quality/qc-records/{id}" },
  { method: "POST", path: "/quality/qc-records/{id}/action", summary: "POST /quality/qc-records/{id}/action" },
  { method: "POST", path: "/quality/qc-records/{id}/quality-decision", summary: "POST /quality/qc-records/{id}/quality-decision" },
];

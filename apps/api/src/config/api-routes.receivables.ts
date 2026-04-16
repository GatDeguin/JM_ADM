import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_RECEIVABLES: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "GET", path: "/receivables/accounts-receivable", summary: "GET /receivables/accounts-receivable" },
  { method: "POST", path: "/receivables/accounts-receivable", summary: "POST /receivables/accounts-receivable" },
  { method: "DELETE", path: "/receivables/accounts-receivable/{id}", summary: "DELETE /receivables/accounts-receivable/{id}" },
  { method: "GET", path: "/receivables/accounts-receivable/{id}", summary: "GET /receivables/accounts-receivable/{id}" },
  { method: "PATCH", path: "/receivables/accounts-receivable/{id}", summary: "PATCH /receivables/accounts-receivable/{id}" },
  { method: "GET", path: "/receivables/accounts-receivable/aging-agenda", summary: "GET /receivables/accounts-receivable/aging-agenda" },
  { method: "POST", path: "/receivables/receipts/apply", summary: "POST /receivables/receipts/apply" },
];

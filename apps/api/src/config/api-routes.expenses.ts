import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_EXPENSES: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "GET", path: "/expenses", summary: "GET /expenses" },
  { method: "POST", path: "/expenses", summary: "POST /expenses" },
  { method: "DELETE", path: "/expenses/{id}", summary: "DELETE /expenses/{id}" },
  { method: "GET", path: "/expenses/{id}", summary: "GET /expenses/{id}" },
  { method: "PATCH", path: "/expenses/{id}", summary: "PATCH /expenses/{id}" },
  { method: "POST", path: "/expenses/{id}/action", summary: "POST /expenses/{id}/action" },
];

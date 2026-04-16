import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_CUSTOMERS: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "GET", path: "/customers", summary: "GET /customers" },
  { method: "POST", path: "/customers", summary: "POST /customers" },
  { method: "DELETE", path: "/customers/{id}", summary: "DELETE /customers/{id}" },
  { method: "GET", path: "/customers/{id}", summary: "GET /customers/{id}" },
  { method: "PATCH", path: "/customers/{id}", summary: "PATCH /customers/{id}" },
  { method: "POST", path: "/customers/{id}/action", summary: "POST /customers/{id}/action" },
];

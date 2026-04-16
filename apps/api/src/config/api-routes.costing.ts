import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_COSTING: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "GET", path: "/costing/monthly-closes", summary: "GET /costing/monthly-closes" },
  { method: "POST", path: "/costing/monthly-closes", summary: "POST /costing/monthly-closes" },
  { method: "DELETE", path: "/costing/monthly-closes/{id}", summary: "DELETE /costing/monthly-closes/{id}" },
  { method: "GET", path: "/costing/monthly-closes/{id}", summary: "GET /costing/monthly-closes/{id}" },
  { method: "PATCH", path: "/costing/monthly-closes/{id}", summary: "PATCH /costing/monthly-closes/{id}" },
  { method: "POST", path: "/costing/monthly-closes/{id}/action", summary: "POST /costing/monthly-closes/{id}/action" },
];

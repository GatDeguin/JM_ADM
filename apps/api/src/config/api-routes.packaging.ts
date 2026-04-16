import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_PACKAGING: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "GET", path: "/packaging/packaging-orders", summary: "GET /packaging/packaging-orders" },
  { method: "POST", path: "/packaging/packaging-orders", summary: "POST /packaging/packaging-orders" },
  { method: "DELETE", path: "/packaging/packaging-orders/{id}", summary: "DELETE /packaging/packaging-orders/{id}" },
  { method: "GET", path: "/packaging/packaging-orders/{id}", summary: "GET /packaging/packaging-orders/{id}" },
  { method: "PATCH", path: "/packaging/packaging-orders/{id}", summary: "PATCH /packaging/packaging-orders/{id}" },
  { method: "POST", path: "/packaging/packaging-orders/{id}/action", summary: "POST /packaging/packaging-orders/{id}/action" },
];

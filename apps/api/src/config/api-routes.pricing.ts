import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_PRICING: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "GET", path: "/pricing/price-lists", summary: "GET /pricing/price-lists" },
  { method: "POST", path: "/pricing/price-lists", summary: "POST /pricing/price-lists" },
  { method: "DELETE", path: "/pricing/price-lists/{id}", summary: "DELETE /pricing/price-lists/{id}" },
  { method: "GET", path: "/pricing/price-lists/{id}", summary: "GET /pricing/price-lists/{id}" },
  { method: "PATCH", path: "/pricing/price-lists/{id}", summary: "PATCH /pricing/price-lists/{id}" },
  { method: "POST", path: "/pricing/price-lists/{id}/action", summary: "POST /pricing/price-lists/{id}/action" },
];

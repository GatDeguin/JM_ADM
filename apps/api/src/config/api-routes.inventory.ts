import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_INVENTORY: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "GET", path: "/inventory/balances", summary: "GET /inventory/balances" },
  { method: "POST", path: "/inventory/counts", summary: "POST /inventory/counts" },
  { method: "GET", path: "/inventory/cycle-counts", summary: "GET /inventory/cycle-counts" },
  { method: "POST", path: "/inventory/internal-transfers", summary: "POST /inventory/internal-transfers" },
  { method: "GET", path: "/inventory/inventory-adjustments", summary: "GET /inventory/inventory-adjustments" },
  { method: "POST", path: "/inventory/inventory-adjustments", summary: "POST /inventory/inventory-adjustments" },
  { method: "DELETE", path: "/inventory/inventory-adjustments/{id}", summary: "DELETE /inventory/inventory-adjustments/{id}" },
  { method: "GET", path: "/inventory/inventory-adjustments/{id}", summary: "GET /inventory/inventory-adjustments/{id}" },
  { method: "PATCH", path: "/inventory/inventory-adjustments/{id}", summary: "PATCH /inventory/inventory-adjustments/{id}" },
  { method: "POST", path: "/inventory/inventory-adjustments/{id}/action", summary: "POST /inventory/inventory-adjustments/{id}/action" },
  { method: "GET", path: "/inventory/movements/traceability", summary: "GET /inventory/movements/traceability" },
  { method: "GET", path: "/inventory/physical-inventories", summary: "GET /inventory/physical-inventories" },
  { method: "GET", path: "/inventory/stock-availability", summary: "GET /inventory/stock-availability" },
  { method: "POST", path: "/inventory/transfers/register", summary: "POST /inventory/transfers/register" },
];

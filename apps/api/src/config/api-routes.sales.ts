import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_SALES: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "POST", path: "/sales/dispatch-orders", summary: "POST /sales/dispatch-orders" },
  { method: "GET", path: "/sales/sales-orders", summary: "GET /sales/sales-orders" },
  { method: "POST", path: "/sales/sales-orders", summary: "POST /sales/sales-orders" },
  { method: "POST", path: "/sales/sales-returns", summary: "POST /sales/sales-returns" },
];

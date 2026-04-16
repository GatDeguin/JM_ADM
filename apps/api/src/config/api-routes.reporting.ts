import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_REPORTING: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "GET", path: "/reporting/dashboard", summary: "GET /reporting/dashboard" },
  { method: "GET", path: "/reporting/data-quality", summary: "GET /reporting/data-quality" },
  { method: "GET", path: "/reporting/data-quality/lists", summary: "GET /reporting/data-quality/lists" },
  { method: "GET", path: "/reporting/finance", summary: "GET /reporting/finance" },
  { method: "GET", path: "/reporting/margins", summary: "GET /reporting/margins" },
  { method: "GET", path: "/reporting/production", summary: "GET /reporting/production" },
  { method: "GET", path: "/reporting/quality", summary: "GET /reporting/quality" },
  { method: "GET", path: "/reporting/sales", summary: "GET /reporting/sales" },
  { method: "POST", path: "/reporting/snapshots/generate", summary: "POST /reporting/snapshots/generate" },
  { method: "GET", path: "/reporting/stock", summary: "GET /reporting/stock" },
];

import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_FINANCE: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "POST", path: "/finance/adjustments/register", summary: "POST /finance/adjustments/register" },
  { method: "POST", path: "/finance/bank-reconciliation/register", summary: "POST /finance/bank-reconciliation/register" },
  { method: "GET", path: "/finance/cash-flow", summary: "GET /finance/cash-flow" },
  { method: "POST", path: "/finance/treasury/transfers/register", summary: "POST /finance/treasury/transfers/register" },
];

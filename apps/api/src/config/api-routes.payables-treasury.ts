import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_PAYABLES_TREASURY: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "GET", path: "/payables_treasury/accounts-payable", summary: "GET /payables_treasury/accounts-payable" },
  { method: "POST", path: "/payables_treasury/accounts-payable", summary: "POST /payables_treasury/accounts-payable" },
  { method: "DELETE", path: "/payables_treasury/accounts-payable/{id}", summary: "DELETE /payables_treasury/accounts-payable/{id}" },
  { method: "GET", path: "/payables_treasury/accounts-payable/{id}", summary: "GET /payables_treasury/accounts-payable/{id}" },
  { method: "PATCH", path: "/payables_treasury/accounts-payable/{id}", summary: "PATCH /payables_treasury/accounts-payable/{id}" },
  { method: "POST", path: "/payables_treasury/bank-reconciliation", summary: "POST /payables_treasury/bank-reconciliation" },
  { method: "POST", path: "/payables_treasury/bank-reconciliations/register", summary: "POST /payables_treasury/bank-reconciliations/register" },
  { method: "POST", path: "/payables_treasury/payments/apply", summary: "POST /payables_treasury/payments/apply" },
  { method: "POST", path: "/payables_treasury/payments/register", summary: "POST /payables_treasury/payments/register" },
  { method: "POST", path: "/payables_treasury/treasury/transfers", summary: "POST /payables_treasury/treasury/transfers" },
  { method: "POST", path: "/payables_treasury/treasury/transfers/register", summary: "POST /payables_treasury/treasury/transfers/register" },
];

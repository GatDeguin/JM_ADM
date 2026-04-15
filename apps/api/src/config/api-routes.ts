export const API_GLOBAL_PREFIX = "api/v1";

export const LEGACY_DOMAIN_REDIRECTS: Record<string, string> = {
  "/inventory": "/stock",
  "/sales": "/commercial/sales",
  "/customers": "/commercial/customers",
  "/payables_treasury": "/finance/payables-treasury",
  "/receivables": "/finance/receivables",
  "/costing": "/finance/costing",
  "/expenses": "/finance/expenses",
  "/audit": "/system/audit",
  "/users": "/system/users",
  "/roles_permissions": "/system/roles-permissions",
  "/attachments": "/system/attachments",
  "/imports": "/system/imports",
  "/masters": "/system/masters",
  "/formulas": "/catalog/formulas",
  "/pricing": "/catalog/pricing",
  "/packaging": "/catalog/packaging",
  "/production": "/production",
};

const NORMALIZED_DOMAIN_REWRITES = Object.entries(LEGACY_DOMAIN_REDIRECTS).reduce<Record<string, string>>(
  (acc, [legacyPrefix, targetPrefix]) => {
    if (legacyPrefix !== targetPrefix) {
      acc[targetPrefix] = legacyPrefix;
    }
    return acc;
  },
  {
    "/fractionation": "/production",
  },
);

export type EndpointContract = {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  summary: string;
  request?: Record<string, unknown>;
  response?: Record<string, unknown>;
  deprecatedLegacyPath?: string;
};

const AUDITED_EFFECTIVE_ROUTES: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "POST", path: "/attachments/upload", summary: "POST /attachments/upload" },
  { method: "GET", path: "/audit/audit-logs", summary: "GET /audit/audit-logs" },
  { method: "POST", path: "/audit/audit-logs", summary: "POST /audit/audit-logs" },
  { method: "DELETE", path: "/audit/audit-logs/{id}", summary: "DELETE /audit/audit-logs/{id}" },
  { method: "GET", path: "/audit/audit-logs/{id}", summary: "GET /audit/audit-logs/{id}" },
  { method: "PATCH", path: "/audit/audit-logs/{id}", summary: "PATCH /audit/audit-logs/{id}" },
  { method: "POST", path: "/audit/audit-logs/{id}/action", summary: "POST /audit/audit-logs/{id}/action" },
  { method: "GET", path: "/audit/audit-logs/timeline/{entity}/{entityId}", summary: "GET /audit/audit-logs/timeline/{entity}/{entityId}" },
  { method: "POST", path: "/auth/login", summary: "POST /auth/login" },
  { method: "POST", path: "/auth/logout", summary: "POST /auth/logout" },
  { method: "GET", path: "/auth/me", summary: "GET /auth/me" },
  { method: "POST", path: "/auth/refresh", summary: "POST /auth/refresh" },
  { method: "GET", path: "/catalog/aliases", summary: "GET /catalog/aliases" },
  { method: "POST", path: "/catalog/aliases", summary: "POST /catalog/aliases" },
  { method: "POST", path: "/catalog/aliases/homologate", summary: "POST /catalog/aliases/homologate" },
  { method: "GET", path: "/catalog/combos", summary: "GET /catalog/combos" },
  { method: "POST", path: "/catalog/combos", summary: "POST /catalog/combos" },
  { method: "POST", path: "/catalog/contextual/upsert", summary: "POST /catalog/contextual/upsert" },
  { method: "GET", path: "/catalog/families", summary: "GET /catalog/families" },
  { method: "POST", path: "/catalog/families", summary: "POST /catalog/families" },
  { method: "POST", path: "/catalog/merge", summary: "POST /catalog/merge" },
  { method: "GET", path: "/catalog/packaging-specs", summary: "GET /catalog/packaging-specs" },
  { method: "POST", path: "/catalog/packaging-specs", summary: "POST /catalog/packaging-specs" },
  { method: "GET", path: "/catalog/presentations", summary: "GET /catalog/presentations" },
  { method: "POST", path: "/catalog/presentations", summary: "POST /catalog/presentations" },
  { method: "GET", path: "/catalog/product-bases", summary: "GET /catalog/product-bases" },
  { method: "POST", path: "/catalog/product-bases", summary: "POST /catalog/product-bases" },
  { method: "GET", path: "/catalog/search", summary: "GET /catalog/search" },
  { method: "GET", path: "/catalog/skus", summary: "GET /catalog/skus" },
  { method: "POST", path: "/catalog/skus", summary: "POST /catalog/skus" },
  { method: "GET", path: "/costing/monthly-closes", summary: "GET /costing/monthly-closes" },
  { method: "POST", path: "/costing/monthly-closes", summary: "POST /costing/monthly-closes" },
  { method: "DELETE", path: "/costing/monthly-closes/{id}", summary: "DELETE /costing/monthly-closes/{id}" },
  { method: "GET", path: "/costing/monthly-closes/{id}", summary: "GET /costing/monthly-closes/{id}" },
  { method: "PATCH", path: "/costing/monthly-closes/{id}", summary: "PATCH /costing/monthly-closes/{id}" },
  { method: "POST", path: "/costing/monthly-closes/{id}/action", summary: "POST /costing/monthly-closes/{id}/action" },
  { method: "GET", path: "/customers", summary: "GET /customers" },
  { method: "POST", path: "/customers", summary: "POST /customers" },
  { method: "DELETE", path: "/customers/{id}", summary: "DELETE /customers/{id}" },
  { method: "GET", path: "/customers/{id}", summary: "GET /customers/{id}" },
  { method: "PATCH", path: "/customers/{id}", summary: "PATCH /customers/{id}" },
  { method: "POST", path: "/customers/{id}/action", summary: "POST /customers/{id}/action" },
  { method: "GET", path: "/expenses", summary: "GET /expenses" },
  { method: "POST", path: "/expenses", summary: "POST /expenses" },
  { method: "DELETE", path: "/expenses/{id}", summary: "DELETE /expenses/{id}" },
  { method: "GET", path: "/expenses/{id}", summary: "GET /expenses/{id}" },
  { method: "PATCH", path: "/expenses/{id}", summary: "PATCH /expenses/{id}" },
  { method: "POST", path: "/expenses/{id}/action", summary: "POST /expenses/{id}/action" },
  { method: "POST", path: "/finance/adjustments/register", summary: "POST /finance/adjustments/register" },
  { method: "POST", path: "/finance/bank-reconciliation/register", summary: "POST /finance/bank-reconciliation/register" },
  { method: "GET", path: "/finance/cash-flow", summary: "GET /finance/cash-flow" },
  { method: "POST", path: "/finance/treasury/transfers/register", summary: "POST /finance/treasury/transfers/register" },
  { method: "GET", path: "/formulas", summary: "GET /formulas" },
  { method: "POST", path: "/formulas", summary: "POST /formulas" },
  { method: "GET", path: "/formulas/{id}", summary: "GET /formulas/{id}" },
  { method: "POST", path: "/formulas/{id}/approve", summary: "POST /formulas/{id}/approve" },
  { method: "POST", path: "/formulas/{id}/obsolete", summary: "POST /formulas/{id}/obsolete" },
  { method: "POST", path: "/formulas/{id}/version", summary: "POST /formulas/{id}/version" },
  { method: "GET", path: "/formulas/compare", summary: "GET /formulas/compare" },
  { method: "POST", path: "/imports/jobs", summary: "POST /imports/jobs" },
  { method: "GET", path: "/imports/jobs/{id}", summary: "GET /imports/jobs/{id}" },
  { method: "POST", path: "/imports/jobs/{id}/confirm", summary: "POST /imports/jobs/{id}/confirm" },
  { method: "POST", path: "/imports/jobs/{id}/file", summary: "POST /imports/jobs/{id}/file" },
  { method: "POST", path: "/imports/jobs/{id}/mapping", summary: "POST /imports/jobs/{id}/mapping" },
  { method: "POST", path: "/imports/jobs/{id}/prevalidate", summary: "POST /imports/jobs/{id}/prevalidate" },
  { method: "GET", path: "/imports/jobs/{id}/preview", summary: "GET /imports/jobs/{id}/preview" },
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
  { method: "POST", path: "/masters/contextual/entities/{entityType}", summary: "POST /masters/contextual/entities/{entityType}" },
  { method: "GET", path: "/masters/contextual/entities/{entityType}/options", summary: "GET /masters/contextual/entities/{entityType}/options" },
  { method: "GET", path: "/masters/units", summary: "GET /masters/units" },
  { method: "POST", path: "/masters/units", summary: "POST /masters/units" },
  { method: "DELETE", path: "/masters/units/{id}", summary: "DELETE /masters/units/{id}" },
  { method: "GET", path: "/masters/units/{id}", summary: "GET /masters/units/{id}" },
  { method: "PATCH", path: "/masters/units/{id}", summary: "PATCH /masters/units/{id}" },
  { method: "POST", path: "/masters/units/{id}/action", summary: "POST /masters/units/{id}/action" },
  { method: "GET", path: "/packaging/packaging-orders", summary: "GET /packaging/packaging-orders" },
  { method: "POST", path: "/packaging/packaging-orders", summary: "POST /packaging/packaging-orders" },
  { method: "DELETE", path: "/packaging/packaging-orders/{id}", summary: "DELETE /packaging/packaging-orders/{id}" },
  { method: "GET", path: "/packaging/packaging-orders/{id}", summary: "GET /packaging/packaging-orders/{id}" },
  { method: "PATCH", path: "/packaging/packaging-orders/{id}", summary: "PATCH /packaging/packaging-orders/{id}" },
  { method: "POST", path: "/packaging/packaging-orders/{id}/action", summary: "POST /packaging/packaging-orders/{id}/action" },
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
  { method: "GET", path: "/pricing/price-lists", summary: "GET /pricing/price-lists" },
  { method: "POST", path: "/pricing/price-lists", summary: "POST /pricing/price-lists" },
  { method: "DELETE", path: "/pricing/price-lists/{id}", summary: "DELETE /pricing/price-lists/{id}" },
  { method: "GET", path: "/pricing/price-lists/{id}", summary: "GET /pricing/price-lists/{id}" },
  { method: "PATCH", path: "/pricing/price-lists/{id}", summary: "PATCH /pricing/price-lists/{id}" },
  { method: "POST", path: "/pricing/price-lists/{id}/action", summary: "POST /pricing/price-lists/{id}/action" },
  { method: "POST", path: "/production/{id}/close-batch", summary: "POST /production/{id}/close-batch" },
  { method: "POST", path: "/production/{id}/fractionate", summary: "POST /production/{id}/fractionate" },
  { method: "POST", path: "/production/{id}/register-consumption", summary: "POST /production/{id}/register-consumption" },
  { method: "POST", path: "/production/{id}/release-batch", summary: "POST /production/{id}/release-batch" },
  { method: "POST", path: "/production/{id}/reserve-materials", summary: "POST /production/{id}/reserve-materials" },
  { method: "POST", path: "/production/{id}/start-batch", summary: "POST /production/{id}/start-batch" },
  { method: "POST", path: "/production/batches/{id}/fractionation-order", summary: "POST /production/batches/{id}/fractionation-order" },
  { method: "GET", path: "/production/batches/{id}/timeline", summary: "GET /production/batches/{id}/timeline" },
  { method: "GET", path: "/production/batches/{id}/validate-parent", summary: "GET /production/batches/{id}/validate-parent" },
  { method: "POST", path: "/production/packaging-orders/{id}/execute-fractionation", summary: "POST /production/packaging-orders/{id}/execute-fractionation" },
  { method: "POST", path: "/production/packaging-orders/{id}/validate-components", summary: "POST /production/packaging-orders/{id}/validate-components" },
  { method: "GET", path: "/production/production-orders", summary: "GET /production/production-orders" },
  { method: "POST", path: "/production/production-orders", summary: "POST /production/production-orders" },
  { method: "GET", path: "/purchasing/goods-receipts", summary: "GET /purchasing/goods-receipts" },
  { method: "POST", path: "/purchasing/goods-receipts", summary: "POST /purchasing/goods-receipts" },
  { method: "GET", path: "/purchasing/goods-receipts/{id}", summary: "GET /purchasing/goods-receipts/{id}" },
  { method: "GET", path: "/purchasing/purchase-orders", summary: "GET /purchasing/purchase-orders" },
  { method: "POST", path: "/purchasing/purchase-orders", summary: "POST /purchasing/purchase-orders" },
  { method: "DELETE", path: "/purchasing/purchase-orders/{id}", summary: "DELETE /purchasing/purchase-orders/{id}" },
  { method: "GET", path: "/purchasing/purchase-orders/{id}", summary: "GET /purchasing/purchase-orders/{id}" },
  { method: "PATCH", path: "/purchasing/purchase-orders/{id}", summary: "PATCH /purchasing/purchase-orders/{id}" },
  { method: "POST", path: "/purchasing/purchase-orders/{id}/action", summary: "POST /purchasing/purchase-orders/{id}/action" },
  { method: "GET", path: "/purchasing/purchase-requests", summary: "GET /purchasing/purchase-requests" },
  { method: "POST", path: "/purchasing/purchase-requests", summary: "POST /purchasing/purchase-requests" },
  { method: "GET", path: "/purchasing/purchase-requests/{id}", summary: "GET /purchasing/purchase-requests/{id}" },
  { method: "PATCH", path: "/purchasing/purchase-requests/{id}", summary: "PATCH /purchasing/purchase-requests/{id}" },
  { method: "POST", path: "/purchasing/purchase-requests/{id}/approve", summary: "POST /purchasing/purchase-requests/{id}/approve" },
  { method: "GET", path: "/quality/checklists/by-batch/{batchId}", summary: "GET /quality/checklists/by-batch/{batchId}" },
  { method: "GET", path: "/quality/qc-records", summary: "GET /quality/qc-records" },
  { method: "POST", path: "/quality/qc-records", summary: "POST /quality/qc-records" },
  { method: "DELETE", path: "/quality/qc-records/{id}", summary: "DELETE /quality/qc-records/{id}" },
  { method: "GET", path: "/quality/qc-records/{id}", summary: "GET /quality/qc-records/{id}" },
  { method: "PATCH", path: "/quality/qc-records/{id}", summary: "PATCH /quality/qc-records/{id}" },
  { method: "POST", path: "/quality/qc-records/{id}/action", summary: "POST /quality/qc-records/{id}/action" },
  { method: "POST", path: "/quality/qc-records/{id}/quality-decision", summary: "POST /quality/qc-records/{id}/quality-decision" },
  { method: "GET", path: "/receivables/accounts-receivable", summary: "GET /receivables/accounts-receivable" },
  { method: "POST", path: "/receivables/accounts-receivable", summary: "POST /receivables/accounts-receivable" },
  { method: "DELETE", path: "/receivables/accounts-receivable/{id}", summary: "DELETE /receivables/accounts-receivable/{id}" },
  { method: "GET", path: "/receivables/accounts-receivable/{id}", summary: "GET /receivables/accounts-receivable/{id}" },
  { method: "PATCH", path: "/receivables/accounts-receivable/{id}", summary: "PATCH /receivables/accounts-receivable/{id}" },
  { method: "GET", path: "/receivables/accounts-receivable/aging-agenda", summary: "GET /receivables/accounts-receivable/aging-agenda" },
  { method: "POST", path: "/receivables/receipts/apply", summary: "POST /receivables/receipts/apply" },
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
  { method: "GET", path: "/roles_permissions/roles", summary: "GET /roles_permissions/roles" },
  { method: "POST", path: "/roles_permissions/roles", summary: "POST /roles_permissions/roles" },
  { method: "DELETE", path: "/roles_permissions/roles/{id}", summary: "DELETE /roles_permissions/roles/{id}" },
  { method: "GET", path: "/roles_permissions/roles/{id}", summary: "GET /roles_permissions/roles/{id}" },
  { method: "PATCH", path: "/roles_permissions/roles/{id}", summary: "PATCH /roles_permissions/roles/{id}" },
  { method: "POST", path: "/roles_permissions/roles/{id}/action", summary: "POST /roles_permissions/roles/{id}/action" },
  { method: "POST", path: "/sales/dispatch-orders", summary: "POST /sales/dispatch-orders" },
  { method: "GET", path: "/sales/sales-orders", summary: "GET /sales/sales-orders" },
  { method: "POST", path: "/sales/sales-orders", summary: "POST /sales/sales-orders" },
  { method: "POST", path: "/sales/sales-returns", summary: "POST /sales/sales-returns" },
  { method: "GET", path: "/users", summary: "GET /users" },
  { method: "POST", path: "/users", summary: "POST /users" },
  { method: "DELETE", path: "/users/{id}", summary: "DELETE /users/{id}" },
  { method: "GET", path: "/users/{id}", summary: "GET /users/{id}" },
  { method: "PATCH", path: "/users/{id}", summary: "PATCH /users/{id}" },
  { method: "POST", path: "/users/{id}/action", summary: "POST /users/{id}/action" },
];

function remapPath(pathname: string, mapping: Record<string, string>): string | null {
  for (const [sourcePrefix, targetPrefix] of Object.entries(mapping)) {
    if (pathname === sourcePrefix || pathname.startsWith(`${sourcePrefix}/`)) {
      return pathname.replace(sourcePrefix, targetPrefix);
    }
  }
  return null;
}

export function mapLegacyPath(pathname: string): string | null {
  return remapPath(pathname, LEGACY_DOMAIN_REDIRECTS);
}

export function mapNormalizedPathToLegacy(pathname: string): string | null {
  return remapPath(pathname, NORMALIZED_DOMAIN_REWRITES);
}

function normalizeContractPathToLegacy(pathname: string): string {
  return pathname.replace(/\{([A-Za-z0-9_]+)\}/g, ":$1");
}

export const API_ENDPOINT_CONTRACT: EndpointContract[] = AUDITED_EFFECTIVE_ROUTES.map((endpoint) => {
  const legacyPath = mapNormalizedPathToLegacy(normalizeContractPathToLegacy(endpoint.path));
  return legacyPath
    ? { ...endpoint, deprecatedLegacyPath: legacyPath.replace(/:([A-Za-z0-9_]+)/g, "{$1}") }
    : endpoint;
});

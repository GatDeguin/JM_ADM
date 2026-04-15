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

export const API_ENDPOINT_CONTRACT: EndpointContract[] = [
  { method: "POST", path: "/auth/login", summary: "Autenticación de usuario.", request: { username: "string", password: "string" }, response: { accessToken: "string", refreshToken: "string" } },
  { method: "GET", path: "/catalog/product-bases", summary: "Lista de productos base.", response: { items: "ProductBase[]" } },
  { method: "GET", path: "/catalog/skus", summary: "Lista de SKUs.", response: { items: "Sku[]" } },
  { method: "GET", path: "/catalog/formulas", summary: "Lista de fórmulas.", response: { items: "Formula[]" }, deprecatedLegacyPath: "/formulas" },
  { method: "GET", path: "/production/production-orders", summary: "Órdenes de producción.", response: { items: "ProductionOrder[]" } },
  { method: "POST", path: "/fractionation/{batchId}/fractionate", summary: "Ejecuta fraccionamiento por lote.", request: { targetUnits: "number", notes: "string?" }, response: { id: "string", status: "string" }, deprecatedLegacyPath: "/production/{batchId}/fractionate" },
  { method: "GET", path: "/stock/inventory-adjustments", summary: "Movimientos de stock.", response: { items: "InventoryAdjustment[]" }, deprecatedLegacyPath: "/inventory/inventory-adjustments" },
  { method: "GET", path: "/commercial/sales/sales-orders", summary: "Pedidos de venta.", response: { items: "SalesOrder[]" }, deprecatedLegacyPath: "/sales/sales-orders" },
  { method: "GET", path: "/finance/receivables/accounts-receivable", summary: "Cuentas por cobrar.", response: { items: "AccountReceivable[]" }, deprecatedLegacyPath: "/receivables/accounts-receivable" },
  { method: "GET", path: "/finance/payables-treasury/accounts-payable", summary: "Cuentas por pagar.", response: { items: "AccountPayable[]" }, deprecatedLegacyPath: "/payables_treasury/accounts-payable" },
  { method: "GET", path: "/reporting/dashboard", summary: "Dashboard consolidado.", response: { kpis: "Record<string, number>", widgets: "unknown[]" } },
  { method: "POST", path: "/system/imports/jobs", summary: "Crea job de importación.", request: { importType: "string", fileName: "string" }, response: { id: "string", status: "DRAFT | READY | ERROR" }, deprecatedLegacyPath: "/imports/jobs" },
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

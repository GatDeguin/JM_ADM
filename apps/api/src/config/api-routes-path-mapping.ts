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

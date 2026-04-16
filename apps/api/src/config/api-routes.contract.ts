import { AUDITED_EFFECTIVE_ROUTES_ATTACHMENTS } from "./api-routes.attachments";
import { AUDITED_EFFECTIVE_ROUTES_AUDIT } from "./api-routes.audit";
import { AUDITED_EFFECTIVE_ROUTES_AUTH } from "./api-routes.auth";
import { AUDITED_EFFECTIVE_ROUTES_CATALOG } from "./api-routes.catalog";
import { AUDITED_EFFECTIVE_ROUTES_COSTING } from "./api-routes.costing";
import { AUDITED_EFFECTIVE_ROUTES_CUSTOMERS } from "./api-routes.customers";
import { AUDITED_EFFECTIVE_ROUTES_EXPENSES } from "./api-routes.expenses";
import { AUDITED_EFFECTIVE_ROUTES_FINANCE } from "./api-routes.finance";
import { AUDITED_EFFECTIVE_ROUTES_FORMULAS } from "./api-routes.formulas";
import { AUDITED_EFFECTIVE_ROUTES_IMPORTS } from "./api-routes.imports";
import { AUDITED_EFFECTIVE_ROUTES_INVENTORY } from "./api-routes.inventory";
import { AUDITED_EFFECTIVE_ROUTES_MASTERS } from "./api-routes.masters";
import { AUDITED_EFFECTIVE_ROUTES_PACKAGING } from "./api-routes.packaging";
import { AUDITED_EFFECTIVE_ROUTES_PAYABLES_TREASURY } from "./api-routes.payables-treasury";
import { AUDITED_EFFECTIVE_ROUTES_PRICING } from "./api-routes.pricing";
import { AUDITED_EFFECTIVE_ROUTES_PRODUCTION } from "./api-routes.production";
import { AUDITED_EFFECTIVE_ROUTES_PURCHASING } from "./api-routes.purchasing";
import { AUDITED_EFFECTIVE_ROUTES_QUALITY } from "./api-routes.quality";
import { AUDITED_EFFECTIVE_ROUTES_RECEIVABLES } from "./api-routes.receivables";
import { AUDITED_EFFECTIVE_ROUTES_REPORTING } from "./api-routes.reporting";
import { AUDITED_EFFECTIVE_ROUTES_ROLES_PERMISSIONS } from "./api-routes.roles-permissions";
import { AUDITED_EFFECTIVE_ROUTES_SALES } from "./api-routes.sales";
import { AUDITED_EFFECTIVE_ROUTES_USERS } from "./api-routes.users";
import { mapNormalizedPathToLegacy } from "./api-routes-path-mapping";

import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  AUDITED_EFFECTIVE_ROUTES_ATTACHMENTS,
  AUDITED_EFFECTIVE_ROUTES_AUDIT,
  AUDITED_EFFECTIVE_ROUTES_AUTH,
  AUDITED_EFFECTIVE_ROUTES_CATALOG,
  AUDITED_EFFECTIVE_ROUTES_COSTING,
  AUDITED_EFFECTIVE_ROUTES_CUSTOMERS,
  AUDITED_EFFECTIVE_ROUTES_EXPENSES,
  AUDITED_EFFECTIVE_ROUTES_FINANCE,
  AUDITED_EFFECTIVE_ROUTES_FORMULAS,
  AUDITED_EFFECTIVE_ROUTES_IMPORTS,
  AUDITED_EFFECTIVE_ROUTES_INVENTORY,
  AUDITED_EFFECTIVE_ROUTES_MASTERS,
  AUDITED_EFFECTIVE_ROUTES_PACKAGING,
  AUDITED_EFFECTIVE_ROUTES_PAYABLES_TREASURY,
  AUDITED_EFFECTIVE_ROUTES_PRICING,
  AUDITED_EFFECTIVE_ROUTES_PRODUCTION,
  AUDITED_EFFECTIVE_ROUTES_PURCHASING,
  AUDITED_EFFECTIVE_ROUTES_QUALITY,
  AUDITED_EFFECTIVE_ROUTES_RECEIVABLES,
  AUDITED_EFFECTIVE_ROUTES_REPORTING,
  AUDITED_EFFECTIVE_ROUTES_ROLES_PERMISSIONS,
  AUDITED_EFFECTIVE_ROUTES_SALES,
  AUDITED_EFFECTIVE_ROUTES_USERS,
].flat();

function normalizeContractPathToLegacy(pathname: string): string {
  return pathname.replace(/\{([A-Za-z0-9_]+)\}/g, ":$1");
}

export const API_ENDPOINT_CONTRACT: EndpointContract[] = AUDITED_EFFECTIVE_ROUTES.map((endpoint) => {
  const legacyPath = mapNormalizedPathToLegacy(normalizeContractPathToLegacy(endpoint.path));
  return legacyPath
    ? { ...endpoint, deprecatedLegacyPath: legacyPath.replace(/:([A-Za-z0-9_]+)/g, "{$1}") }
    : endpoint;
});

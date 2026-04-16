import { API_ENDPOINT_CONTRACT } from "./api-routes.contract";
import {
  LEGACY_DOMAIN_REDIRECTS,
  mapLegacyPath,
  mapNormalizedPathToLegacy,
} from "./api-routes-path-mapping";

export const API_GLOBAL_PREFIX = "api/v1";

export { API_ENDPOINT_CONTRACT, LEGACY_DOMAIN_REDIRECTS, mapLegacyPath, mapNormalizedPathToLegacy };
export type { EndpointContract } from "./api-routes.types";

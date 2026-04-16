import {
  API_GLOBAL_PREFIX,
  mapLegacyPath,
  mapNormalizedPathToLegacy,
} from "../config/api-routes";
import { recordLegacyPathAccess } from "./legacy-path-telemetry";

function getPathAndSearch(req: any): { path: string; search: string } {
  const candidateUrl = (req.originalUrl ?? req.url ?? req.path ?? "/") as string;
  const parsedUrl = new URL(candidateUrl, "http://localhost");
  return { path: parsedUrl.pathname, search: parsedUrl.search };
}

export function apiPathMappingMiddleware(req: any, res: any, next: () => void) {
  const { path: originalPath, search } = getPathAndSearch(req);
  const prefixedRoot = `/${API_GLOBAL_PREFIX}`;

  if (!originalPath.startsWith(prefixedRoot)) {
    const mappedPath = mapLegacyPath(originalPath);
    const normalized = mappedPath ?? originalPath;

    if (mappedPath) {
      recordLegacyPathAccess(originalPath, `${prefixedRoot}${mappedPath}`);
    }

    return res.redirect(308, `${prefixedRoot}${normalized}${search}`);
  }

  const internalPath = originalPath.slice(prefixedRoot.length) || "/";
  const mappedInternalPath = mapLegacyPath(internalPath);

  if (mappedInternalPath) {
    res.setHeader("Deprecation", "true");
    res.setHeader("Sunset", "Wed, 31 Dec 2026 23:59:59 GMT");
    res.setHeader("Link", `<${prefixedRoot}${mappedInternalPath}>; rel=\"successor-version\"`);
    recordLegacyPathAccess(internalPath, `${prefixedRoot}${mappedInternalPath}`);
    return res.redirect(308, `${prefixedRoot}${mappedInternalPath}${search}`);
  }

  const legacyRouteForExecution = mapNormalizedPathToLegacy(internalPath);
  if (legacyRouteForExecution) {
    req.url = `${prefixedRoot}${legacyRouteForExecution}${search}`;
  }

  return next();
}

import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_AUTH: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "POST", path: "/auth/login", summary: "POST /auth/login" },
  { method: "POST", path: "/auth/logout", summary: "POST /auth/logout" },
  { method: "GET", path: "/auth/me", summary: "GET /auth/me" },
  { method: "POST", path: "/auth/refresh", summary: "POST /auth/refresh" },
];

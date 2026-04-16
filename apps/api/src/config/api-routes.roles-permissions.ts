import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_ROLES_PERMISSIONS: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "GET", path: "/roles_permissions/roles", summary: "GET /roles_permissions/roles" },
  { method: "POST", path: "/roles_permissions/roles", summary: "POST /roles_permissions/roles" },
  { method: "DELETE", path: "/roles_permissions/roles/{id}", summary: "DELETE /roles_permissions/roles/{id}" },
  { method: "GET", path: "/roles_permissions/roles/{id}", summary: "GET /roles_permissions/roles/{id}" },
  { method: "PATCH", path: "/roles_permissions/roles/{id}", summary: "PATCH /roles_permissions/roles/{id}" },
  { method: "POST", path: "/roles_permissions/roles/{id}/action", summary: "POST /roles_permissions/roles/{id}/action" },
];

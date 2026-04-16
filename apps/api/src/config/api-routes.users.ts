import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_USERS: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "GET", path: "/users", summary: "GET /users" },
  { method: "POST", path: "/users", summary: "POST /users" },
  { method: "DELETE", path: "/users/{id}", summary: "DELETE /users/{id}" },
  { method: "GET", path: "/users/{id}", summary: "GET /users/{id}" },
  { method: "PATCH", path: "/users/{id}", summary: "PATCH /users/{id}" },
  { method: "POST", path: "/users/{id}/action", summary: "POST /users/{id}/action" },
];

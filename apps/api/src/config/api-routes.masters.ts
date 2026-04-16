import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_MASTERS: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "POST", path: "/masters/contextual/entities/{entityType}", summary: "POST /masters/contextual/entities/{entityType}" },
  { method: "GET", path: "/masters/contextual/entities/{entityType}/options", summary: "GET /masters/contextual/entities/{entityType}/options" },
  { method: "GET", path: "/masters/units", summary: "GET /masters/units" },
  { method: "POST", path: "/masters/units", summary: "POST /masters/units" },
  { method: "DELETE", path: "/masters/units/{id}", summary: "DELETE /masters/units/{id}" },
  { method: "GET", path: "/masters/units/{id}", summary: "GET /masters/units/{id}" },
  { method: "PATCH", path: "/masters/units/{id}", summary: "PATCH /masters/units/{id}" },
  { method: "POST", path: "/masters/units/{id}/action", summary: "POST /masters/units/{id}/action" },
];

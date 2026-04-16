import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_IMPORTS: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "POST", path: "/imports/jobs", summary: "POST /imports/jobs" },
  { method: "GET", path: "/imports/jobs/{id}", summary: "GET /imports/jobs/{id}" },
  { method: "POST", path: "/imports/jobs/{id}/confirm", summary: "POST /imports/jobs/{id}/confirm" },
  { method: "POST", path: "/imports/jobs/{id}/file", summary: "POST /imports/jobs/{id}/file" },
  { method: "POST", path: "/imports/jobs/{id}/mapping", summary: "POST /imports/jobs/{id}/mapping" },
  { method: "POST", path: "/imports/jobs/{id}/prevalidate", summary: "POST /imports/jobs/{id}/prevalidate" },
  { method: "GET", path: "/imports/jobs/{id}/preview", summary: "GET /imports/jobs/{id}/preview" },
];

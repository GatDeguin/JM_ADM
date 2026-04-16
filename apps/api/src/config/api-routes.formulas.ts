import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_FORMULAS: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "GET", path: "/formulas", summary: "GET /formulas" },
  { method: "POST", path: "/formulas", summary: "POST /formulas" },
  { method: "GET", path: "/formulas/{id}", summary: "GET /formulas/{id}" },
  { method: "POST", path: "/formulas/{id}/approve", summary: "POST /formulas/{id}/approve" },
  { method: "POST", path: "/formulas/{id}/obsolete", summary: "POST /formulas/{id}/obsolete" },
  { method: "POST", path: "/formulas/{id}/version", summary: "POST /formulas/{id}/version" },
  { method: "GET", path: "/formulas/compare", summary: "GET /formulas/compare" },
];

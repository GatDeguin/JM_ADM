import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_PRODUCTION: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "POST", path: "/production/{id}/close-batch", summary: "POST /production/{id}/close-batch" },
  { method: "POST", path: "/production/{id}/fractionate", summary: "POST /production/{id}/fractionate" },
  { method: "POST", path: "/production/{id}/register-consumption", summary: "POST /production/{id}/register-consumption" },
  { method: "POST", path: "/production/{id}/release-batch", summary: "POST /production/{id}/release-batch" },
  { method: "POST", path: "/production/{id}/reserve-materials", summary: "POST /production/{id}/reserve-materials" },
  { method: "POST", path: "/production/{id}/start-batch", summary: "POST /production/{id}/start-batch" },
  { method: "POST", path: "/production/batches/{id}/fractionation-order", summary: "POST /production/batches/{id}/fractionation-order" },
  { method: "GET", path: "/production/batches/{id}/timeline", summary: "GET /production/batches/{id}/timeline" },
  { method: "GET", path: "/production/batches/{id}/validate-parent", summary: "GET /production/batches/{id}/validate-parent" },
  { method: "POST", path: "/production/packaging-orders/{id}/execute-fractionation", summary: "POST /production/packaging-orders/{id}/execute-fractionation" },
  { method: "POST", path: "/production/packaging-orders/{id}/validate-components", summary: "POST /production/packaging-orders/{id}/validate-components" },
  { method: "GET", path: "/production/production-orders", summary: "GET /production/production-orders" },
  { method: "POST", path: "/production/production-orders", summary: "POST /production/production-orders" },
];

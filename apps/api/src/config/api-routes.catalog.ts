import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_CATALOG: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "GET", path: "/catalog/aliases", summary: "GET /catalog/aliases" },
  { method: "POST", path: "/catalog/aliases", summary: "POST /catalog/aliases" },
  { method: "POST", path: "/catalog/aliases/homologate", summary: "POST /catalog/aliases/homologate" },
  { method: "GET", path: "/catalog/combos", summary: "GET /catalog/combos" },
  { method: "POST", path: "/catalog/combos", summary: "POST /catalog/combos" },
  { method: "POST", path: "/catalog/contextual/upsert", summary: "POST /catalog/contextual/upsert" },
  { method: "GET", path: "/catalog/families", summary: "GET /catalog/families" },
  { method: "POST", path: "/catalog/families", summary: "POST /catalog/families" },
  { method: "POST", path: "/catalog/merge", summary: "POST /catalog/merge" },
  { method: "GET", path: "/catalog/packaging-specs", summary: "GET /catalog/packaging-specs" },
  { method: "POST", path: "/catalog/packaging-specs", summary: "POST /catalog/packaging-specs" },
  { method: "GET", path: "/catalog/presentations", summary: "GET /catalog/presentations" },
  { method: "POST", path: "/catalog/presentations", summary: "POST /catalog/presentations" },
  { method: "GET", path: "/catalog/product-bases", summary: "GET /catalog/product-bases" },
  { method: "POST", path: "/catalog/product-bases", summary: "POST /catalog/product-bases" },
  { method: "GET", path: "/catalog/search", summary: "GET /catalog/search" },
  { method: "GET", path: "/catalog/skus", summary: "GET /catalog/skus" },
  { method: "POST", path: "/catalog/skus", summary: "POST /catalog/skus" },
];

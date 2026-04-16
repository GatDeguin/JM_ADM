import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_PURCHASING: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "GET", path: "/purchasing/goods-receipts", summary: "GET /purchasing/goods-receipts" },
  { method: "POST", path: "/purchasing/goods-receipts", summary: "POST /purchasing/goods-receipts" },
  { method: "GET", path: "/purchasing/goods-receipts/{id}", summary: "GET /purchasing/goods-receipts/{id}" },
  { method: "GET", path: "/purchasing/purchase-orders", summary: "GET /purchasing/purchase-orders" },
  { method: "POST", path: "/purchasing/purchase-orders", summary: "POST /purchasing/purchase-orders" },
  { method: "DELETE", path: "/purchasing/purchase-orders/{id}", summary: "DELETE /purchasing/purchase-orders/{id}" },
  { method: "GET", path: "/purchasing/purchase-orders/{id}", summary: "GET /purchasing/purchase-orders/{id}" },
  { method: "PATCH", path: "/purchasing/purchase-orders/{id}", summary: "PATCH /purchasing/purchase-orders/{id}" },
  { method: "POST", path: "/purchasing/purchase-orders/{id}/action", summary: "POST /purchasing/purchase-orders/{id}/action" },
  { method: "GET", path: "/purchasing/purchase-requests", summary: "GET /purchasing/purchase-requests" },
  { method: "POST", path: "/purchasing/purchase-requests", summary: "POST /purchasing/purchase-requests" },
  { method: "GET", path: "/purchasing/purchase-requests/{id}", summary: "GET /purchasing/purchase-requests/{id}" },
  { method: "PATCH", path: "/purchasing/purchase-requests/{id}", summary: "PATCH /purchasing/purchase-requests/{id}" },
  { method: "POST", path: "/purchasing/purchase-requests/{id}/approve", summary: "POST /purchasing/purchase-requests/{id}/approve" },
];

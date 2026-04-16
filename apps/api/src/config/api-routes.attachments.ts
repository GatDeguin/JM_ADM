import type { EndpointContract } from "./api-routes.types";

export const AUDITED_EFFECTIVE_ROUTES_ATTACHMENTS: Pick<EndpointContract, "method" | "path" | "summary">[] = [
  { method: "POST", path: "/attachments/upload", summary: "POST /attachments/upload" },
];

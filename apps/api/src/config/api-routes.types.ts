export type EndpointContract = {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  summary: string;
  request?: Record<string, unknown>;
  response?: Record<string, unknown>;
  deprecatedLegacyPath?: string;
};

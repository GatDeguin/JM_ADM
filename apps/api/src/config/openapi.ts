import { API_ENDPOINT_CONTRACT, API_GLOBAL_PREFIX } from "./api-routes";

export const OPENAPI_VERSION = "1.0.0";

export function buildOpenApiDocument() {
  return {
    openapi: "3.1.0",
    info: {
      title: "JM ADM API",
      version: OPENAPI_VERSION,
      description:
        "Contrato unificado de endpoints con request/response y rutas legadas deprecadas.",
    },
    servers: [{ url: `/${API_GLOBAL_PREFIX}` }],
    paths: API_ENDPOINT_CONTRACT.reduce<Record<string, Record<string, unknown>>>(
      (acc, endpoint) => {
        const method = endpoint.method.toLowerCase();
        acc[endpoint.path] ??= {};
        acc[endpoint.path][method] = {
          summary: endpoint.summary,
          deprecated: Boolean(endpoint.deprecatedLegacyPath),
          requestBody: endpoint.request
            ? {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      example: endpoint.request,
                    },
                  },
                },
              }
            : undefined,
          responses: {
            200: {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    example: endpoint.response ?? {},
                  },
                },
              },
            },
          },
        };
        return acc;
      },
      {},
    ),
    "x-legacyRoutes": API_ENDPOINT_CONTRACT.filter((it) => it.deprecatedLegacyPath).map((it) => ({
      legacy: it.deprecatedLegacyPath,
      successor: it.path,
    })),
  };
}

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { API_ENV } from "./config/env";
import {
  API_ENDPOINT_CONTRACT,
  API_GLOBAL_PREFIX,
} from "./config/api-routes";
import { apiPathMappingMiddleware } from "./middleware/api-path-mapping.middleware";

async function bootstrap() {
  if (API_ENV.APP_ROLE === "worker") {
    await NestFactory.createApplicationContext(AppModule);
    return;
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix(API_GLOBAL_PREFIX);

  app.use(apiPathMappingMiddleware);

  const express = app.getHttpAdapter().getInstance();
  express.get(`/${API_GLOBAL_PREFIX}/openapi.json`, (_req: any, res: any) => {
    res.json({
      openapi: "3.1.0",
      info: {
        title: "JM ADM API",
        version: "1.0.0",
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
      "x-legacyRoutes": API_ENDPOINT_CONTRACT.filter((it) => it.deprecatedLegacyPath).map(
        (it) => ({
          legacy: it.deprecatedLegacyPath,
          successor: it.path,
        }),
      ),
    });
  });

  await app.listen(API_ENV.PORT);
}

bootstrap();

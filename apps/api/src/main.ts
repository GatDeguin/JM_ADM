import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { API_ENV } from "./config/env";
import { API_GLOBAL_PREFIX } from "./config/api-routes";
import { buildOpenApiDocument } from "./config/openapi";
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
    res.json(buildOpenApiDocument());
  });

  await app.listen(API_ENV.PORT);
}

bootstrap();

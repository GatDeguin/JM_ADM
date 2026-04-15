import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { API_ENV } from "./config/env";

async function bootstrap() {
  if (API_ENV.APP_ROLE === "worker") {
    await NestFactory.createApplicationContext(AppModule);
    return;
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });
  await app.listen(API_ENV.PORT);
}

bootstrap();

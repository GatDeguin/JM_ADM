import "reflect-metadata";
import { describe, expect, it } from "vitest";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { API_ENDPOINT_CONTRACT, API_GLOBAL_PREFIX } from "./api-routes";
import { PrismaService } from "../infrastructure/prisma/prisma.service";

process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/jmadm_test";

(PrismaService.prototype as { onModuleInit: () => Promise<void> }).onModuleInit = async () => {};
(PrismaService.prototype as { enableShutdownHooks: () => Promise<void> }).enableShutdownHooks = async () => {};

type EndpointKey = `${"GET" | "POST" | "PATCH" | "PUT" | "DELETE"} ${string}`;

function toContractPath(pathname: string): string {
  const withoutPrefix = pathname.replace(new RegExp(`^/${API_GLOBAL_PREFIX}`), "");
  const normalized = withoutPrefix.startsWith("/") ? withoutPrefix : `/${withoutPrefix}`;
  return normalized.replace(/:([A-Za-z0-9_]+)/g, "{$1}");
}

function getDeclaredContractKeys(): Set<EndpointKey> {
  return new Set(
    API_ENDPOINT_CONTRACT.map((endpoint) => `${endpoint.method} ${endpoint.path}` as EndpointKey),
  );
}

async function getRegisteredRouteKeys(): Promise<Set<EndpointKey>> {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  await app.init();

  const server: any = app.getHttpServer();
  const router = server?._events?.request?._router || server?._events?.request?.router;
  const keys = new Set<EndpointKey>();

  for (const layer of router?.stack ?? []) {
    if (!layer.route) continue;
    const path = layer.route.path.startsWith("/") ? layer.route.path : `/${layer.route.path}`;
    for (const [method, enabled] of Object.entries(layer.route.methods ?? {})) {
      if (!enabled) continue;
      keys.add(`${method.toUpperCase()} ${toContractPath(path)}` as EndpointKey);
    }
  }

  await app.close();
  return keys;
}

describe("API endpoint contract drift", () => {
  it("debe cubrir exactamente las rutas productivas registradas por Nest", async () => {
    const declared = getDeclaredContractKeys();
    const registered = await getRegisteredRouteKeys();

    const missingInContract = [...registered].filter((key) => !declared.has(key)).sort();
    const staleInContract = [...declared].filter((key) => !registered.has(key)).sort();

    expect(
      { missingInContract, staleInContract },
      `Contrato desalineado. Missing=${missingInContract.join(", ")} | Stale=${staleInContract.join(", ")}`,
    ).toEqual({ missingInContract: [], staleInContract: [] });
  });
});

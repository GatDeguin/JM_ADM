import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildOpenApiDocument, OPENAPI_VERSION } from "../apps/api/src/config/openapi";

const outputDir = join(process.cwd(), "apps/api/openapi");
mkdirSync(outputDir, { recursive: true });

const openapi = buildOpenApiDocument();
const versionTag = `v${OPENAPI_VERSION.split(".")[0]}`;
const versionedPath = join(outputDir, `openapi.${versionTag}.json`);
const latestPath = join(outputDir, "openapi.latest.json");

const payload = `${JSON.stringify(openapi, null, 2)}\n`;
writeFileSync(versionedPath, payload, "utf8");
writeFileSync(latestPath, payload, "utf8");

console.log(`OpenAPI generado en ${versionedPath} y ${latestPath}`);

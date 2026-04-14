import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";

const appDir = join(process.cwd(), "app");

const criticalRoutes = [
  "/inicio",
  "/operacion/produccion",
  "/catalogo/productos-base",
  "/comercial/pedidos",
  "/finanzas/tesoreria",
  "/buscar",
  "/tecnica/formulas",
  "/stock/lotes",
  "/abastecimiento/proveedores",
  "/analitica/reportes",
  "/sistema/usuarios"
];

describe("web", () => {
  it("works", () => expect(true).toBe(true));

  it("no tiene rutas muertas en navegación principal", () => {
    for (const route of criticalRoutes) {
      const normalized = route.replace(/^\//, "");
      const routeDir = join(appDir, normalized, "page.tsx");
      const routeIndex = join(appDir, normalized, "index.tsx");
      expect(existsSync(routeDir) || existsSync(routeIndex), `Ruta sin página: ${route}`).toBe(true);
    }
  });
});

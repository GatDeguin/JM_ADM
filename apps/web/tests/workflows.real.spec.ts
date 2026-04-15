import { expect, test } from "@playwright/test";
import { API_BASE_URL } from "../lib/env";
import { workflowData } from "./fixtures/workflow-data";
import { altaContextual, altaCritica } from "./helpers";

const runRealFlows = process.env.E2E_REAL === "1";

test.describe("flujos reales contra API + DB de test", () => {
  test.skip(!runRealFlows, "Set E2E_REAL=1 para ejecutar flujos reales contra API + DB de test");

  test("real/login", async ({ page }) => {
    const loginResponse = await page.request.post(`${API_BASE_URL}/auth/login`, {
      data: { email: "admin@demo.local", password: "secret" },
    });
    expect(loginResponse.ok()).toBeTruthy();
  });

  test("real/op + cierre lote + fraccionamiento", async ({ page }) => {
    await page.goto("/operacion/produccion/nueva");
    await altaContextual(
      page,
      workflowData.production.orderName,
      workflowData.production.orderCode,
    );

    await page.goto(`/operacion/lotes/${workflowData.production.lotId}`);
    await expect(
      page.getByRole("heading", { name: `Lote ${workflowData.production.lotId}` }),
    ).toBeVisible();

    await page.goto("/operacion/fraccionamiento");
    await altaContextual(page, workflowData.fractioning.name, workflowData.fractioning.code);
  });

  test("real/venta + cobranza + pago", async ({ page }) => {
    await page.goto("/comercial/pedidos");
    await altaContextual(page, workflowData.sales.orderName, workflowData.sales.orderCode);

    await page.goto("/finanzas/cobranzas");
    await altaContextual(
      page,
      workflowData.treasury.receiptName,
      workflowData.treasury.receiptCode,
    );

    await page.goto("/finanzas/pagos");
    await altaContextual(
      page,
      workflowData.treasury.paymentName,
      workflowData.treasury.paymentCode,
    );
  });

  test("real/importación", async ({ page }) => {
    await page.goto("/sistema/importaciones");
    await altaContextual(
      page,
      workflowData.importation.importName,
      workflowData.importation.importCode,
    );
    await expect(page.getByText("Import", { exact: false })).toBeVisible();
  });

  test("real/fórmulas", async ({ page }) => {
    await page.goto("/tecnica/formulas");
    await altaCritica(page, workflowData.formula.name, workflowData.formula.code, "draft");
    await expect(page.getByText("Cambios guardados correctamente.")).toBeVisible();
  });
});

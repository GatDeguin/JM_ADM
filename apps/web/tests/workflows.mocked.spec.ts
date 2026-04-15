import { expect, test } from "@playwright/test";
import { workflowData } from "./fixtures/workflow-data";
import { altaContextual, altaCritica, mockJson } from "./helpers";

test("smoke/login mockeado", async ({ page }) => {
  await mockJson(page, "**/auth/login", "POST", { token: "demo-token" });
  const loginResponse = await page.request.post("http://localhost:4000/auth/login", {
    data: { email: "admin@demo.local", password: "secret" },
  });

  expect(loginResponse.ok()).toBeTruthy();
  await expect(loginResponse.json()).resolves.toMatchObject({ token: "demo-token" });
});

test("smoke/op + cierre lote + fraccionamiento (mock puntual)", async ({ page }) => {
  await mockJson(page, "**/production/production-orders", "GET", []);
  await mockJson(page, "**/production/production-orders", "POST", { id: "op-1" }, 201);

  await page.goto("/operacion/produccion/nueva");
  await altaContextual(page, workflowData.production.orderName, workflowData.production.orderCode);

  await page.goto(`/operacion/lotes/${workflowData.production.lotId}`);
  await expect(
    page.getByRole("heading", { name: `Lote ${workflowData.production.lotId}` }),
  ).toBeVisible();

  await page.goto("/operacion/fraccionamiento");
  await altaContextual(page, workflowData.fractioning.name, workflowData.fractioning.code);
});

test("smoke/venta + cobranza + pago (mock puntual)", async ({ page }) => {
  await mockJson(page, "**/sales/sales-orders", "GET", []);
  await mockJson(page, "**/sales/sales-orders", "POST", { id: "so-1", status: "confirmed" }, 201);

  await page.goto("/comercial/pedidos");
  await altaContextual(page, workflowData.sales.orderName, workflowData.sales.orderCode);

  await page.goto("/finanzas/cobranzas");
  await altaContextual(page, workflowData.treasury.receiptName, workflowData.treasury.receiptCode);

  await page.goto("/finanzas/pagos");
  await altaContextual(page, workflowData.treasury.paymentName, workflowData.treasury.paymentCode);
});

test("smoke/importación (mock puntual)", async ({ page }) => {
  await mockJson(page, "**/imports", "GET", []);
  await mockJson(
    page,
    "**/imports",
    "POST",
    { id: "imp-1", warnings: ["Campo opcional vacío"] },
    201,
  );

  await page.goto("/sistema/importaciones");
  await altaContextual(
    page,
    workflowData.importation.importName,
    workflowData.importation.importCode,
  );
  await expect(page.getByText("⚠", { exact: false })).toBeVisible();
});

test("smoke/fórmula con alta crítica (mock puntual)", async ({ page }) => {
  await mockJson(page, "**/formulas", "GET", [
    { id: "frm-1", name: "Formula QA", code: "F-QA", status: "draft" },
  ]);
  await mockJson(page, "**/formulas", "POST", { id: "frm-2" }, 201);

  await page.goto("/tecnica/formulas");
  await altaCritica(page, workflowData.formula.name, workflowData.formula.code, "draft");
  await expect(page.getByText("Cambios guardados correctamente.")).toBeVisible();
});

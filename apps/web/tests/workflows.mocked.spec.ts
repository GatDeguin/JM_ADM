import { expect, test } from "@playwright/test";
import { API_BASE_URL } from "../lib/env";
import { workflowData } from "./fixtures/workflow-data";
import { altaContextual, altaCritica, mockJson } from "./helpers";

test("smoke/login mockeado", async ({ page }) => {
  await mockJson(page, "**/auth/login", "POST", { token: "demo-token" });
  const loginResponse = await page.request.post(`${API_BASE_URL}/auth/login`, {
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

test("e2e/alta anidada SKU + retorno al origen", async ({ page }) => {
  await mockJson(page, "**/masters/contextual/entities/sku/options", "GET", []);
  await mockJson(page, "**/masters/contextual/entities/cliente/options", "GET", []);
  await mockJson(page, "**/masters/contextual/entities/lista/options", "GET", []);
  await mockJson(
    page,
    "**/masters/contextual/entities/sku",
    "POST",
    { id: "sku-new", label: "SKU Nest", meta: "PB · Presentación" },
    201,
  );

  await page.goto("/comercial/pedidos/nuevo?step=seleccion");
  const skuSection = page.locator("section", { hasText: "SKU" }).first();
  await skuSection.getByRole("button", { name: "Crear rápido" }).click();
  await page.getByLabel("Nombre").fill("SKU Nest");
  await page.getByLabel("Descripción").fill("Alta anidada");
  await page.getByRole("button", { name: "Guardar" }).click();

  await expect(skuSection.getByRole("option", { name: "SKU Nest" })).toBeVisible();
  await expect(skuSection.getByRole("option", { name: "SKU Nest" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("e2e/retorno origen autoselecciona entidades contextuales", async ({ page }) => {
  await mockJson(page, "**/masters/contextual/entities/producto/options", "GET", [
    { id: "pb-ctx", label: "Producto contextual" },
  ]);
  await mockJson(page, "**/masters/contextual/entities/formula_version/options", "GET", [
    { id: "fv-ctx", label: "F-1 v1" },
  ]);

  let payload: any = null;
  await page.route("**/production/production-orders", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    payload = route.request().postDataJSON();
    return route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ id: "op-ctx", code: "OP-CTX" }),
    });
  });

  await page.goto(
    "/operacion/produccion/nueva?contextualEntityType=producto&contextualEntityId=pb-ctx",
  );
  await page
    .locator("section", { hasText: "Versión de fórmula" })
    .getByRole("option", { name: "F-1 v1" })
    .click();
  await page.getByPlaceholder("OP-2026-001").fill("OP-CTX");
  await page.locator('input[type="number"]').first().fill("10");
  await page.getByRole("button", { name: "Crear orden" }).click();

  await expect.poll(() => payload?.productBaseId).toBe("pb-ctx");
  await expect.poll(() => payload?.formulaVersionId).toBe("fv-ctx");
});

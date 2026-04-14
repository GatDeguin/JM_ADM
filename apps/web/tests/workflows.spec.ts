import { expect, test, type Page } from "@playwright/test";
import { workflowData } from "./fixtures/workflow-data";

async function altaContextual(page: Page, name: string, code: string) {
  await page.getByLabel("Nombre").fill(name);
  await page.getByLabel("Código").fill(code);
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("cell", { name })).toBeVisible();
}

test("workflow fórmula → aprobación", async ({ page }) => {
  await page.goto("/tecnica/formulas");
  await altaContextual(page, workflowData.formula.name, workflowData.formula.code);

  await page.goto("/tecnica/aprobaciones");
  await expect(page.getByRole("heading", { name: "Tecnica · Aprobaciones" })).toBeVisible();
});

test("workflow producto/SKU con alta contextual", async ({ page }) => {
  await page.goto("/catalogo/productos-base");
  await altaContextual(page, workflowData.sku.productName, workflowData.sku.productCode);

  await page.goto("/catalogo/skus");
  await altaContextual(page, workflowData.sku.skuName, workflowData.sku.skuCode);
});

test("workflow OP → lote → QC → liberación", async ({ page }) => {
  await page.goto("/operacion/produccion/nueva");
  await altaContextual(page, workflowData.production.orderName, workflowData.production.orderCode);

  await page.goto(`/operacion/lotes/${workflowData.production.lotId}`);
  await expect(page.getByRole("heading", { name: `Lote ${workflowData.production.lotId}` })).toBeVisible();

  await page.goto("/operacion/calidad");
  await expect(page.getByRole("heading", { name: "Operacion · Calidad" })).toBeVisible();

  await page.goto("/operacion/historial-lotes");
  await expect(page.getByRole("heading", { name: "Operacion · Historial Lotes" })).toBeVisible();
});

test("workflow fraccionamiento", async ({ page }) => {
  await page.goto("/operacion/fraccionamiento");
  await altaContextual(page, workflowData.fractioning.name, workflowData.fractioning.code);
});

test("workflow venta → despacho", async ({ page }) => {
  await page.goto("/comercial/pedidos");
  await altaContextual(page, workflowData.sales.orderName, workflowData.sales.orderCode);

  await page.goto("/comercial/despachos");
  await altaContextual(page, workflowData.sales.dispatchName, workflowData.sales.dispatchCode);
});

test("workflow cobranza/pago", async ({ page }) => {
  await page.goto("/finanzas/cobranzas");
  await altaContextual(page, workflowData.treasury.receiptName, workflowData.treasury.receiptCode);

  await page.goto("/finanzas/pagos");
  await altaContextual(page, workflowData.treasury.paymentName, workflowData.treasury.paymentCode);
});

test("workflow homologación e importación con warnings", async ({ page }) => {
  await page.goto("/comercial/clientes/homologacion");
  await altaContextual(page, workflowData.importation.homologationName, workflowData.importation.homologationCode);

  await page.goto("/sistema/importaciones");
  await altaContextual(page, workflowData.importation.importName, workflowData.importation.importCode);

  await expect(page.getByText("homologación", { exact: false })).toBeVisible();
});

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

test("e2e/import wizard punta a punta con preview y bitácora", async ({ page }) => {
  await mockJson(page, "**/imports/jobs", "POST", { id: "imp-wizard-1" }, 201);
  await mockJson(
    page,
    "**/imports/jobs/imp-wizard-1/file",
    "POST",
    {
      id: "imp-wizard-1",
      detectedColumns: ["codigo", "cliente", "homologacion"],
      rowFeedback: [{ rowNumber: 2, level: "warning", message: "Cantidad de columnas inconsistente." }],
    },
  );
  await mockJson(page, "**/imports/jobs/imp-wizard-1/mapping", "POST", { id: "imp-wizard-1", status: "validating" });
  await mockJson(
    page,
    "**/imports/jobs/imp-wizard-1/prevalidate",
    "POST",
    {
      warnings: ["Fila 2: falta code"],
      summary: { total: 2, invalid: 1, pendingHomologation: 1 },
      rows: [
        {
          key: "c-1",
          canonicalValue: { code: "c-1", name: "cliente uno" },
          warnings: [],
          suggestions: [],
          duplicate: false,
          valid: true,
          pendingHomologation: false,
        },
        {
          key: "c-2",
          canonicalValue: { name: "cliente sin codigo", pending_homologation: true },
          warnings: ["Fila 2: falta code"],
          suggestions: ["Si el valor existe en otro maestro, registrar alias y reintentar"],
          duplicate: false,
          valid: false,
          pendingHomologation: true,
        },
      ],
    },
  );
  await mockJson(page, "**/imports/jobs/imp-wizard-1/confirm", "POST", { event: "import.started", queued: false });
  await mockJson(page, "**/audit", "POST", { ok: true }, 201);
  await mockJson(
    page,
    "**/audit/audit-logs/timeline/ImportBatch/imp-wizard-1?limit=50",
    "GET",
    [{ id: "a1", action: "import.confirmed", origin: "imports.confirm", createdAt: "2026-04-15T12:00:00.000Z", after: { queued: false } }],
  );

  await page.goto("/sistema/importaciones");
  await page.getByLabel("Archivo").setInputFiles({
    name: "customers.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("codigo,cliente,homologacion\nC-1,Cliente Uno,no\n,Cliente Dos,si"),
  });

  await page.getByRole("button", { name: "Subir y detectar columnas" }).click();
  await expect(page.getByText("Mapeo editable")).toBeVisible();
  await page.getByRole("button", { name: "Ejecutar prevalidación" }).click();
  await expect(page.getByText("Preview paginado con sugerencias")).toBeVisible();
  await expect(page.getByText("pending_homologation")).toBeVisible();
  await page.getByRole("button", { name: "Continuar a confirmación" }).click();
  await page.getByRole("button", { name: "Confirmar importación" }).click();
  await expect(page.getByText("Bitácora de importación")).toBeVisible();
  await expect(page.getByText("import.confirmed")).toBeVisible();
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

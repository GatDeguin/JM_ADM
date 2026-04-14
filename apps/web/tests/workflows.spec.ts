import { expect, test, type Page } from "@playwright/test";
import { workflowData } from "./fixtures/workflow-data";

async function altaContextual(page: Page, name: string, code: string) {
  await page.getByLabel("Nombre").fill(name);
  await page.getByLabel("Código").fill(code);
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("cell", { name })).toBeVisible();
}

async function altaCritica(page: Page, name: string, code: string, status = "draft") {
  await page.getByRole("button", { name: "Crear / Editar" }).click();
  await page.getByLabel("Nombre / Referencia").fill(name);
  await page.getByLabel("Código").fill(code);
  await page.getByLabel("Estado / Campo negocio").selectOption(status);
  await page.getByRole("dialog", { name: "Formulario de creación y edición" }).getByRole("button", { name: "Guardar" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.route("http://localhost:4000/**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.endsWith("/auth/login") && method === "POST") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ token: "demo-token" }) });
    }

    if (url.includes("/masters/contextual/entities/sku/options") && method === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    }

    if (url.includes("/masters/contextual/entities/sku") && method === "POST") {
      return route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "ctx-sku-1", label: "SKU Rápido", meta: "anidado" }),
      });
    }

    if (url.endsWith("/catalog/skus") && method === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    }
    if (url.endsWith("/catalog/skus") && method === "POST") {
      return route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ id: "sku-1" }) });
    }

    if (url.endsWith("/formulas") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([{ id: "frm-1", name: "Formula QA", code: "F-QA", status: "draft" }]),
      });
    }
    if (url.endsWith("/formulas") && method === "POST") {
      return route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ id: "frm-2" }) });
    }
    if (url.includes("/formulas/") && url.endsWith("/approve") && method === "POST") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ event: "formula.approved" }) });
    }

    if (url.endsWith("/production/production-orders") && method === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    }
    if (url.endsWith("/production/production-orders") && method === "POST") {
      return route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ id: "op-1" }) });
    }

    if (url.endsWith("/sales/sales-orders") && method === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    }
    if (url.endsWith("/sales/sales-orders") && method === "POST") {
      return route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ id: "so-1", status: "confirmed" }) });
    }

    if (url.endsWith("/customers/customers") && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([{ id: "cust-1", code: "C-1", name: "Cliente Demo", status: "pending_homologation" }]),
      });
    }
    if (url.endsWith("/customers/customers") && method === "POST") {
      return route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ id: "cust-2" }) });
    }
    if (url.includes("/customers/customers/") && url.endsWith("/action") && method === "POST") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "cust-1", status: "active" }) });
    }

    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });
});

test("workflow login", async ({ page }) => {
  const loginResponse = await page.request.post("http://localhost:4000/auth/login", {
    data: { email: "admin@demo.local", password: "secret" },
  });

  expect(loginResponse.ok()).toBeTruthy();
  await expect(loginResponse.json()).resolves.toMatchObject({ token: "demo-token" });
});

test("workflow alta contextual SKU (con creación anidada)", async ({ page }) => {
  await page.goto("/catalogo/skus");
  await page.getByRole("button", { name: "Crear rápido" }).click();
  await page.getByRole("dialog").getByLabel("Nombre").fill("SKU Rápido");
  await page.getByRole("dialog").getByLabel("Descripción").fill("anidado");
  await page.getByRole("dialog").getByRole("button", { name: "Guardar" }).click();

  await altaCritica(page, workflowData.sku.skuName, workflowData.sku.skuCode, "active");
  await expect(page.getByText("Cambios guardados correctamente.")).toBeVisible();
});

test("workflow creación/aprobación de fórmula", async ({ page }) => {
  await page.goto("/tecnica/formulas");
  await altaCritica(page, workflowData.formula.name, workflowData.formula.code, "draft");
  await page.getByRole("button", { name: "Homologar" }).click();
  await expect(page.getByText("Acción ejecutada correctamente.")).toBeVisible();
});

test("workflow OP y cierre de lote + fraccionamiento", async ({ page }) => {
  await page.goto("/operacion/produccion/nueva");
  await altaContextual(page, workflowData.production.orderName, workflowData.production.orderCode);

  await page.goto("/operacion/lotes/LOT-QA-2026");
  await expect(page.getByRole("heading", { name: "Lote LOT-QA-2026" })).toBeVisible();

  await page.goto("/operacion/fraccionamiento");
  await altaContextual(page, workflowData.fractioning.name, workflowData.fractioning.code);
});

test("workflow venta + despacho, cobranza + pago", async ({ page }) => {
  await page.goto("/comercial/pedidos");
  await altaContextual(page, workflowData.sales.orderName, workflowData.sales.orderCode);

  await page.goto("/comercial/despachos");
  await altaContextual(page, workflowData.sales.dispatchName, workflowData.sales.dispatchCode);

  await page.goto("/finanzas/cobranzas");
  await altaContextual(page, workflowData.treasury.receiptName, workflowData.treasury.receiptCode);

  await page.goto("/finanzas/pagos");
  await altaContextual(page, workflowData.treasury.paymentName, workflowData.treasury.paymentCode);
});

test("workflow homologación + importación con warnings", async ({ page }) => {
  await page.goto("/comercial/clientes");
  await altaCritica(page, workflowData.importation.homologationName, workflowData.importation.homologationCode, "pending_homologation");
  await page.getByRole("button", { name: "Homologar" }).click();
  await expect(page.getByText("Acción ejecutada correctamente.")).toBeVisible();

  await page.goto("/sistema/importaciones");
  await altaContextual(page, workflowData.importation.importName, workflowData.importation.importCode);
  await expect(page.getByText("⚠", { exact: false })).toBeVisible();
});

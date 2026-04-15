import { expect, type Page } from "@playwright/test";

export async function altaContextual(page: Page, name: string, code: string) {
  await page.getByLabel("Nombre").fill(name);
  await page.getByLabel("Código").fill(code);
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("cell", { name })).toBeVisible();
}

export async function altaCritica(page: Page, name: string, code: string, status = "draft") {
  await page.getByRole("button", { name: "Crear / Editar" }).click();
  await page.getByLabel("Nombre / Referencia").fill(name);
  await page.getByLabel("Código").fill(code);
  await page.getByLabel("Estado / Campo negocio").selectOption(status);
  await page
    .getByRole("dialog", { name: "Formulario de creación y edición" })
    .getByRole("button", { name: "Guardar" })
    .click();
}

export async function mockJson(
  page: Page,
  url: string | RegExp,
  method: string,
  body: unknown,
  status = 200,
) {
  await page.route(url, async (route) => {
    if (route.request().method() !== method) {
      return route.fallback();
    }

    return route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

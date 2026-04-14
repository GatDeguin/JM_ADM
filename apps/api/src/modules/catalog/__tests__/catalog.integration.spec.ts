import { describe, expect, it } from "vitest";
import { ConflictException } from "@nestjs/common";
import { CatalogService } from "../application/catalog.service";
import { integrationFixtures } from "../../../test-data/integration-fixtures";

describe("catalog integration", () => {
  it("crea producto base", async () => {
    const service = new CatalogService({
      createProductBase: async (input: { code: string; name: string }) => ({ id: "pb-created", ...input }),
    } as never);

    const created = (await service.createProductBase({
      code: integrationFixtures.catalog.newProductBase.code,
      name: integrationFixtures.catalog.newProductBase.name,
    })) as { code: string };

    expect(created.code).toBe(integrationFixtures.catalog.newProductBase.code);
  });

  it("controla duplicados de código", async () => {
    const service = new CatalogService({
      createProductBase: async () => {
        throw { code: "P2002" };
      },
    } as never);

    await expect(service.createProductBase({ code: "PB-100", name: "Duplicado" })).rejects.toBeInstanceOf(ConflictException);
  });

  it("homologa alias a una entidad canónica", async () => {
    const service = new CatalogService({
      homologateAlias: async (input: { alias: string; canonicalId: string }) => ({ id: "a-1", ...input, status: "active" }),
    } as never);

    const response = await service.homologateAlias({
      entityType: "product_base",
      alias: "ORO CREMA",
      canonicalId: "pb-1",
      canonicalName: "Tratamiento Botox en Crema",
    });

    expect(response.status).toBe("active");
  });
});

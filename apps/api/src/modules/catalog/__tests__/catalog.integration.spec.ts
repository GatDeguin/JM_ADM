import { describe, expect, it } from "vitest";
import { ConflictException } from "@nestjs/common";
import { CatalogService } from "../application/catalog.service";
import { integrationFixtures } from "../../../test-data/integration-fixtures";

describe("catalog integration", () => {
  it("crea producto base", async () => {
    const service = new CatalogService({
      createProductBase: async (code: string, name: string) => ({ id: "pb-created", code, name }),
    } as never);

    const created = await service.createProductBase(
      integrationFixtures.catalog.newProductBase.code,
      integrationFixtures.catalog.newProductBase.name,
    );

    expect(created.code).toBe(integrationFixtures.catalog.newProductBase.code);
  });

  it("controla duplicados de código", async () => {
    const service = new CatalogService({
      createProductBase: async () => {
        throw { code: "P2002" };
      },
    } as never);

    await expect(service.createProductBase("PB-100", "Duplicado")).rejects.toBeInstanceOf(ConflictException);
  });
});

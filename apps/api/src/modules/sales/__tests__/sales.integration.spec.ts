import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { SalesService } from "../application/sales.service";
import { integrationFixtures } from "../../../test-data/integration-fixtures";

describe("sales integration", () => {
  const repositoryStub = {
    customerExists: vi.fn(async () => true),
    priceListExists: vi.fn(async () => true),
    getExistingSkuIds: vi.fn(async (ids: string[]) => ids),
    findComboComponents: vi.fn(async () => [{ skuId: "SKU-C1", qty: 2 }]),
    createOrder: vi.fn(async () => ({})),
  };

  it("bloquea venta sin cliente", async () => {
    const service = new SalesService(repositoryStub as never);

    await expect(service.create("SO-1", "", "PL-1", 200, [{ skuId: "SKU-1", qty: 1 }])).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("bloquea venta sin sku", async () => {
    const service = new SalesService(repositoryStub as never);

    await expect(
      service.create(
        integrationFixtures.sales.orderCode,
        integrationFixtures.sales.customerId,
        integrationFixtures.sales.priceListId,
        integrationFixtures.sales.total,
        [],
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("explota combos en componentes", async () => {
    const service = new SalesService(repositoryStub as never);

    await service.create("SO-COMBO", "C-1", "PL-1", 100, [{ comboId: "combo-1", qty: 3 }]);

    expect(repositoryStub.findComboComponents).toHaveBeenCalledWith("combo-1");
    expect(repositoryStub.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({ items: [{ skuId: "SKU-C1", qty: 6 }] }),
    );
  });
});

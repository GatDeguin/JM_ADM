import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { SalesService } from "../application/sales.service";
import { integrationFixtures } from "../../../test-data/integration-fixtures";

describe("sales integration", () => {
  it("bloquea venta sin cliente", async () => {
    const service = new SalesService({ createOrder: async () => ({}) } as never);

    await expect(service.create("SO-1", "", "PL-1", 200, [{ skuId: "SKU-1", qty: 1 }])).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("bloquea venta sin sku", async () => {
    const service = new SalesService({ createOrder: async () => ({}) } as never);

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
});

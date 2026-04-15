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
    createOrder: vi.fn(async () => ({ id: "so-1", status: "confirmed" })),
    createDispatch: vi.fn((payload) => ({ event: "sales.dispatch.created", ...payload })),
    createReturn: vi.fn((payload) => ({ event: "sales.return.created", ...payload })),
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
    ).rejects.toMatchObject({ response: expect.objectContaining({ code: "RULE_SALES_ITEMS_REQUIRED" }) });
  });

  it("bloquea venta con lista inválida", async () => {
    const service = new SalesService({ ...repositoryStub, priceListExists: vi.fn(async () => false) } as never);

    await expect(service.create("SO-2", "C-1", "PL-X", 100, [{ skuId: "SKU-1", qty: 1 }])).rejects.toBeInstanceOf(BadRequestException);
  });

  it("explota combos en componentes y persiste estado confirmado", async () => {
    const service = new SalesService(repositoryStub as never);

    const result = await service.create("SO-COMBO", "C-1", "PL-1", 100, [{ comboId: "combo-1", qty: 3 }]);

    expect(result.event).toBe("sales.order.confirmed");
    expect(repositoryStub.findComboComponents).toHaveBeenCalledWith("combo-1");
    expect(repositoryStub.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({ items: [{ skuId: "SKU-C1", qty: 6 }] }),
    );
  });

  it("registra despacho y devolución", () => {
    const service = new SalesService(repositoryStub as never);

    const dispatch = service.dispatch({ code: "DSP-1", salesOrderId: "so-1", items: [{ skuId: "SKU-1", qty: 2 }] });
    const returned = service.registerReturn({ code: "DEV-1", salesOrderId: "so-1", reason: "daño" });

    expect(dispatch.event).toBe("sales.dispatch.created");
    expect(returned.event).toBe("sales.return.created");
  });
});

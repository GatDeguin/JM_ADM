import { describe, expect, it, vi } from "vitest";
import { PricingService } from "../pricing/application/pricing.service";
import { InventoryService } from "../inventory/application/inventory.service";
import { ReceivablesService } from "../receivables/application/receivables.service";
import { PayablesTreasuryService } from "../payables_treasury/application/payables_treasury.service";
import { SalesService } from "../sales/application/sales.service";
import { ProductionService } from "../production/application/production.service";

describe("critical rules integration", () => {
  it("bloquea y permite reglas críticas de pricing", async () => {
    const service = new PricingService({
      create: vi.fn(async (data) => ({ id: "pl-1", ...data })),
      get: vi.fn(async () => ({ id: "pl-1", code: "LP-1", name: "Mayorista", startsAt: new Date(), status: "archived" })),
      update: vi.fn(),
      list: vi.fn(),
      remove: vi.fn(),
      runAction: vi.fn(),
    } as never);

    await expect(async () => service.create({ code: "LP-1", name: "Lista", startsAt: "" })).rejects.toMatchObject({
      response: expect.objectContaining({ code: "RULE_PRICING_START_DATE_REQUIRED" }),
    });

    await expect(service.update("pl-1", { name: "nueva" })).rejects.toMatchObject({
      response: expect.objectContaining({ code: "RULE_PRICING_ARCHIVED_IMMUTABLE" }),
    });
  });

  it("bloquea transferencia interna con mismo origen/destino", async () => {
    const service = new InventoryService({ createInternalTransfer: vi.fn() } as never);

    await expect(
      service.createInternalTransfer({
        itemId: "it-1",
        qty: 1,
        reason: "move",
        fromWarehouseId: "wh-1",
        toWarehouseId: "wh-1",
        fromLocationId: "loc-1",
        toLocationId: "loc-1",
      }),
    ).rejects.toMatchObject({ response: expect.objectContaining({ code: "RULE_INVENTORY_TRANSFER_DIFFERENT_LOCATION" }) });
  });

  it("valida reglas críticas de recibos", async () => {
    const service = new ReceivablesService({ runAction: vi.fn(async () => ({ receiptId: "r-1", receivables: [] })) } as never);

    await expect(async () => service.runAction({ code: "R-1", cashAccountId: "cash-1", amount: 100, allocations: [] })).rejects.toMatchObject({
      response: expect.objectContaining({ code: "RULE_RECEIVABLES_ALLOCATIONS_REQUIRED" }),
    });

    await expect(
      service.runAction({ code: "R-1", cashAccountId: "cash-1", amount: 100, allocations: [{ receivableId: "ar-1", amount: 100 }] }),
    ).resolves.toEqual({ receiptId: "r-1", receivables: [] });
  });

  it("valida reglas críticas de pagos/tesorería", async () => {
    const service = new PayablesTreasuryService({ runAction: vi.fn(async () => ({ paymentId: "p-1", payables: [] })), transferFunds: vi.fn() } as never);

    await expect(async () => service.runAction({ code: "P-1", cashAccountId: "cash-1", amount: 100, allocations: [] })).rejects.toMatchObject({
      response: expect.objectContaining({ code: "RULE_PAYABLES_ALLOCATIONS_REQUIRED" }),
    });

    await expect(async () => service.transferFunds({ fromCashAccountId: "cash-1", toCashAccountId: "cash-1", amount: 10 })).rejects.toMatchObject({
      response: expect.objectContaining({ code: "RULE_PAYABLES_TRANSFER_DIFFERENT_ACCOUNT" }),
    });
  });

  it("bloquea pedido comercial con total inválido", async () => {
    const service = new SalesService({
      customerExists: vi.fn(async () => true),
      priceListExists: vi.fn(async () => true),
      getExistingSkuIds: vi.fn(async (ids: string[]) => ids),
      createOrder: vi.fn(),
      findComboComponents: vi.fn(),
    } as never);

    await expect(service.create("SO-1", "C-1", "PL-1", 0, [{ skuId: "SKU-1", qty: 1 }])).rejects.toMatchObject({
      response: expect.objectContaining({ code: "RULE_SALES_TOTAL_POSITIVE" }),
    });
  });

  it("bloquea transiciones inválidas de estado en producción", async () => {
    const service = new ProductionService({ findOrder: vi.fn(async () => ({ id: "op-1", status: "draft" })), findBatch: vi.fn(async () => ({ id: "b-1", status: "released" })) } as never);

    await expect(service.reserveMaterials("op-1")).rejects.toMatchObject({
      response: expect.objectContaining({ code: "RULE_PRODUCTION_STATUS_TRANSITION" }),
    });

    await expect(service.close("b-1", { responsible: "u-1", consumptions: [], wastes: [], outputs: [{ itemId: "fg", qty: 1 }] })).rejects.toMatchObject({
      response: expect.objectContaining({ code: "RULE_PRODUCTION_STATUS_TRANSITION" }),
    });
  });
});

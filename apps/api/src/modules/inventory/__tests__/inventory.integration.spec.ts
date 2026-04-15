import { describe, expect, it, vi } from "vitest";
import { InventoryService } from "../application/inventory.service";

describe("inventory integration", () => {
  it("propaga la acción de ajuste al repositorio", async () => {
    const repo = {
      list: vi.fn(async () => []), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(),
      runAction: vi.fn(async (_id, payload) => ({ id: "adj-1", ...payload })),
    };
    const service = new InventoryService(repo as never);

    const result = await service.runAction("adj-1", { reason: "Conteo" });

    expect(repo.runAction).toHaveBeenCalledWith("adj-1", { reason: "Conteo" });
    expect(result.reason).toBe("Conteo");
  });

  it("expone balance, disponibilidad y trazabilidad desde el servicio", async () => {
    const repo = {
      list: vi.fn(async () => []),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      runAction: vi.fn(),
      getBalances: vi.fn(async () => ({ byItem: [], byLocation: [], byLot: [] })),
      getStockAvailability: vi.fn(async () => []),
      createInternalTransfer: vi.fn(async () => ({ id: "transfer-1" })),
      listCounts: vi.fn(async () => []),
      createCount: vi.fn(async () => ({ id: "count-1" })),
      getMovementTraceability: vi.fn(async () => []),
    };
    const service = new InventoryService(repo as never);

    await service.getBalances({ itemId: "item-1" });
    await service.getStockAvailability("item-1");
    await service.createInternalTransfer({
      itemId: "item-1",
      qty: 10,
      fromWarehouseId: "wh-1",
      toWarehouseId: "wh-2",
      reason: "Reubicación",
    });
    await service.listCounts("cycle");
    await service.createCount({ warehouseId: "wh-1", type: "physical" });
    await service.getMovementTraceability({ itemId: "item-1" });

    expect(repo.getBalances).toHaveBeenCalledWith({ itemId: "item-1" });
    expect(repo.getStockAvailability).toHaveBeenCalledWith("item-1");
    expect(repo.createInternalTransfer).toHaveBeenCalled();
    expect(repo.listCounts).toHaveBeenCalledWith("cycle");
    expect(repo.createCount).toHaveBeenCalledWith({ warehouseId: "wh-1", type: "physical" });
    expect(repo.getMovementTraceability).toHaveBeenCalledWith({ itemId: "item-1" });
  });
});

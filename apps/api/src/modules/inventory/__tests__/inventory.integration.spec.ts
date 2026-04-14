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
});

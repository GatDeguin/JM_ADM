import { describe, expect, it, vi } from "vitest";
import { CostingService } from "../application/costing.service";

describe("costing integration", () => {
  it("ejecuta cierre mensual via acción", async () => {
    const repo = {
      list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(),
      runAction: vi.fn(async () => ({ id: "mc-1", status: "closed" })),
    };
    const service = new CostingService(repo as never);

    const result = await service.runAction("mc-1", {});
    expect(result.status).toBe("closed");
  });
});

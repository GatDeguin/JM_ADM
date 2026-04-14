import { describe, expect, it, vi } from "vitest";
import { PricingService } from "../application/pricing.service";

describe("pricing integration", () => {
  it("crea lista de precio y archiva por acción", async () => {
    const repo = {
      list: vi.fn(), get: vi.fn(), update: vi.fn(), remove: vi.fn(),
      create: vi.fn(async (data) => ({ id: "pl-1", ...data })),
      runAction: vi.fn(async () => ({ id: "pl-1", status: "archived" })),
    };
    const service = new PricingService(repo as never);

    const created = await service.create({ code: "LP-1", name: "Mayorista", startsAt: new Date().toISOString() });
    const acted = await service.runAction("pl-1", {});

    expect(created.name).toBe("Mayorista");
    expect(acted.status).toBe("archived");
  });
});

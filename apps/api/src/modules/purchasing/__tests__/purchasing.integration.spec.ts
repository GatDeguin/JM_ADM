import { describe, expect, it, vi } from "vitest";
import { PurchasingService } from "../application/purchasing.service";

describe("purchasing integration", () => {
  it("crea orden y ejecuta acción de negocio", async () => {
    const repo = {
      list: vi.fn(), get: vi.fn(), update: vi.fn(), remove: vi.fn(),
      create: vi.fn(async (data) => ({ id: "po-1", ...data })),
      runAction: vi.fn(async () => ({ id: "po-1", status: "approved" })),
    };
    const service = new PurchasingService(repo as never);

    const created = await service.create({ code: "PO-1", supplierId: "sup-1", status: "draft" });
    const acted = await service.runAction("po-1", {});

    expect(created.code).toBe("PO-1");
    expect(acted.status).toBe("approved");
  });
});

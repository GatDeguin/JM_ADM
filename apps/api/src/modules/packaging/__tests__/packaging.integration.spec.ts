import { describe, expect, it, vi } from "vitest";
import { PackagingService } from "../application/packaging.service";

describe("packaging integration", () => {
  it("crea orden de empaque", async () => {
    const repo = {
      list: vi.fn(), get: vi.fn(), update: vi.fn(), remove: vi.fn(), runAction: vi.fn(),
      create: vi.fn(async (data) => ({ id: "pk-1", ...data })),
    };
    const service = new PackagingService(repo as never);

    const created = await service.create({ code: "PK-1", parentBatchId: "b-1", skuId: "sku-1", qty: 20 });
    expect(created.qty).toBe(20);
  });
});

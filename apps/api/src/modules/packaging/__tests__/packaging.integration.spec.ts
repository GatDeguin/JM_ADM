import { describe, expect, it, vi } from "vitest";
import { PackagingService } from "../application/packaging.service";
import { PackagingRepository } from "../infrastructure/packaging.repository";
import { DOMAIN_EVENT_NAMES } from "../../../common/events/domain-event-contract";

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

  it("emite packaging.order.closed con payload mínimo al cerrar fraccionamiento", async () => {
    const emitted: unknown[] = [];
    const repository = new PackagingRepository(
      {
        $transaction: async (cb: (tx: any) => Promise<unknown>) =>
          cb({
            packagingOrder: { update: async () => ({ id: "pk-1", status: "released" }) },
            auditLog: { create: async () => ({ id: "audit-1" }) },
          }),
      } as never,
      { emit: (event: unknown) => emitted.push(event), on: () => undefined } as never,
    );

    await repository.runAction("pk-1", { action: "close" } as never);
    expect(emitted[0]).toMatchObject({
      name: DOMAIN_EVENT_NAMES.packagingClosed,
      payload: { packagingOrderId: "pk-1", status: "released" },
    });
  });
});

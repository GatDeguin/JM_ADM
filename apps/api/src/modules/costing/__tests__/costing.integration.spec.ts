import { describe, expect, it, vi } from "vitest";
import { CostingService } from "../application/costing.service";
import { CostingRepository } from "../infrastructure/costing.repository";
import { DOMAIN_EVENT_NAMES } from "../../../common/events/domain-event-contract";

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

  it("emite costing.monthly_close.closed con payload mínimo", async () => {
    const emitted: unknown[] = [];
    const repository = new CostingRepository(
      {
        $transaction: async (cb: (tx: any) => Promise<unknown>) =>
          cb({
            monthlyClose: { update: async () => ({ id: "mc-1", status: "closed", closedAt: new Date("2026-04-15T00:00:00.000Z") }) },
            auditLog: { create: async () => ({ id: "audit-1" }) },
          }),
      } as never,
      { emit: (event: unknown) => emitted.push(event), on: () => undefined } as never,
    );

    await repository.runAction("mc-1", {});
    expect(emitted[0]).toMatchObject({
      name: DOMAIN_EVENT_NAMES.monthlyCloseClosed,
      payload: { monthlyCloseId: "mc-1", status: "closed" },
    });
  });
});

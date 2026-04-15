import { describe, expect, it, vi } from "vitest";
import { ReceivablesService } from "../application/receivables.service";
import { ReceivablesRepository } from "../infrastructure/receivables.repository";
import { DOMAIN_EVENT_NAMES } from "../../../common/events/domain-event-contract";

describe("receivables integration", () => {
  it("aplica recibo y devuelve receivables afectados", async () => {
    const repo = {
      list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), agingAgenda: vi.fn(async () => []),
      runAction: vi.fn(async () => ({ receiptId: "rcp-1", receivables: [{ id: "ar-1", status: "paid" }] })),
    };
    const service = new ReceivablesService(repo as never);

    const result = await service.runAction({
      code: "REC-1", cashAccountId: "cash-1", amount: 100, allocations: [{ receivableId: "ar-1", amount: 100 }],
    });

    expect(result.receiptId).toBe("rcp-1");
    expect(result.receivables[0].status).toBe("paid");
  });

  it("emite receivables.receipt.registered con payload mínimo", async () => {
    const emitted: unknown[] = [];
    const tx = {
      accountsReceivable: {
        findUniqueOrThrow: vi.fn(async () => ({ id: "ar-1", customerId: "c-1", balance: 100, amount: 100, dueDate: new Date() })),
        update: vi.fn(async () => ({ id: "ar-1", status: "paid" })),
      },
      receipt: { create: vi.fn(async () => ({ id: "rec-1" })) },
      receiptAllocation: { create: vi.fn(async () => ({ id: "ra-1" })) },
      auditLog: { create: vi.fn(async () => ({ id: "audit-1" })) },
    };
    const repository = new ReceivablesRepository(
      { $transaction: vi.fn(async (cb: (arg: typeof tx) => Promise<unknown>) => cb(tx)) } as never,
      { emit: (event: unknown) => emitted.push(event), on: () => undefined } as never,
    );

    await repository.runAction({ code: "REC-1", cashAccountId: "cash-1", amount: 100, allocations: [{ receivableId: "ar-1", amount: 100 }] });
    expect(emitted[0]).toMatchObject({
      name: DOMAIN_EVENT_NAMES.receiptRegistered,
      payload: { receiptId: "rec-1", cashAccountId: "cash-1", amount: 100 },
    });
  });
});

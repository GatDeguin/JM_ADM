import { describe, expect, it, vi } from "vitest";
import { ReceivablesService } from "../application/receivables.service";

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
});

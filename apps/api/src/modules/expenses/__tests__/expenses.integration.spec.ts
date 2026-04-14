import { describe, expect, it, vi } from "vitest";
import { ExpensesService } from "../application/expenses.service";

describe("expenses integration", () => {
  it("actualiza estado y aplica acción", async () => {
    const repo = {
      list: vi.fn(), get: vi.fn(), create: vi.fn(), remove: vi.fn(),
      update: vi.fn(async (_id, data) => ({ id: "exp-1", ...data })),
      runAction: vi.fn(async () => ({ id: "exp-1", status: "paid" })),
    };
    const service = new ExpensesService(repo as never);

    const updated = await service.update("exp-1", { status: "partial" });
    const acted = await service.runAction("exp-1", {});

    expect(updated.status).toBe("partial");
    expect(acted.status).toBe("paid");
  });
});

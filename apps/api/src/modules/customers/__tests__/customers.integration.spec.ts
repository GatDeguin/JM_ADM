import { describe, expect, it, vi } from "vitest";
import { CustomersService } from "../application/customers.service";

describe("customers integration", () => {
  it("delegates CRUD and business action to repository", async () => {
    const repo = {
      list: vi.fn(async () => [{ id: "c-1" }]),
      get: vi.fn(async () => ({ id: "c-1" })),
      create: vi.fn(async (data) => ({ id: "c-2", ...data })),
      update: vi.fn(async (_id, data) => ({ id: "c-1", ...data })),
      remove: vi.fn(async () => ({ id: "c-1" })),
      runAction: vi.fn(async () => ({ id: "c-1", status: "archived" })),
    };

    const service = new CustomersService(repo as never);
    await service.list();
    await service.get("c-1");
    await service.create({ code: "C1", name: "Acme" });
    await service.update("c-1", { name: "Acme 2" });
    await service.remove("c-1");
    const acted = await service.runAction("c-1", {});

    expect(repo.list).toHaveBeenCalled();
    expect(repo.runAction).toHaveBeenCalledWith("c-1", {});
    expect(acted.status).toBe("archived");
  });
});

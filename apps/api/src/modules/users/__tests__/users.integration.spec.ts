import { describe, expect, it, vi } from "vitest";
import { UsersService } from "../application/users.service";

describe("users integration", () => {
  it("crea usuario y ejecuta acción", async () => {
    const repo = {
      list: vi.fn(), get: vi.fn(), update: vi.fn(), remove: vi.fn(),
      create: vi.fn(async (data) => ({ id: "u-1", ...data })),
      runAction: vi.fn(async () => ({ id: "u-1", status: "archived" })),
    };
    const service = new UsersService(repo as never);

    const created = await service.create({ email: "demo@acme.com", name: "Demo", passwordHash: "1234" });
    const acted = await service.runAction("u-1", {});

    expect(created.email).toBe("demo@acme.com");
    expect(acted.status).toBe("archived");
  });
});

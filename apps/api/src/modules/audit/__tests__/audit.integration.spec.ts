import { describe, expect, it, vi } from "vitest";
import { AuditService } from "../application/audit.service";

describe("audit integration", () => {
  it("consulta timeline por entidad", async () => {
    const repo = {
      list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), runAction: vi.fn(),
      listByEntity: vi.fn(async () => [{ id: "a-1", entity: "customer", entityId: "c-1" }]),
    };
    const service = new AuditService(repo as never);

    const timeline = await service.timeline("customer", "c-1", 10);

    expect(repo.listByEntity).toHaveBeenCalledWith("customer", "c-1", 10);
    expect(timeline).toHaveLength(1);
  });
});

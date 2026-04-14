import { describe, expect, it, vi } from "vitest";
import { MastersService } from "../application/masters.service";

describe("masters integration", () => {
  it("crea entidad contextual y deja auditoría del flujo origen", async () => {
    const repositoryStub = {
      createContextualEntity: vi.fn(async () => ({ id: "ctx-1", label: "SKU Contextual", meta: "anidado" })),
      createContextualAudit: vi.fn(async () => undefined),
    };

    const service = new MastersService(repositoryStub as never);

    const created = await service.createContextualEntity("sku", {
      label: "SKU Contextual",
      meta: "anidado",
      originFlow: "catalogo-skus",
    });

    expect(created.id).toBe("ctx-1");
    expect(repositoryStub.createContextualAudit).toHaveBeenCalledWith(
      expect.objectContaining({ entityType: "sku", entityId: "ctx-1", originFlow: "catalogo-skus" }),
    );
  });
});

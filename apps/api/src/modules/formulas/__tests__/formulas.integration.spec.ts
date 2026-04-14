import { describe, expect, it, vi } from "vitest";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { FormulasService } from "../application/formulas.service";

describe("formulas integration", () => {
  it("falla detalle cuando no existe", async () => {
    const service = new FormulasService({ findById: async () => null } as never);
    await expect(service.detail("missing")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("controla conflicto por código duplicado", async () => {
    const service = new FormulasService({
      create: async () => {
        throw { code: "P2002" };
      },
    } as never);

    await expect(service.create("F-1", "Formula")).rejects.toBeInstanceOf(ConflictException);
  });

  it("crea y aprueba fórmula auditando trazabilidad", async () => {
    const repositoryStub = {
      create: vi.fn(async () => ({ id: "frm-1", code: "F-100", name: "Base", status: "draft" })),
      findById: vi.fn(async () => ({ id: "frm-1", code: "F-100", name: "Base", status: "draft" })),
      approve: vi.fn(async () => ({ id: "frm-1", code: "F-100", name: "Base", status: "approved" })),
    };
    const auditTrailStub = {
      logCreate: vi.fn(async () => undefined),
      logHomologation: vi.fn(async () => undefined),
    };

    const service = new FormulasService(repositoryStub as never, auditTrailStub);

    const created = await service.create("F-100", "Base");
    const approved = await service.approve("frm-1");

    expect(created.status).toBe("draft");
    expect(approved.event).toBe("formula.approved");
    expect(approved.formula.status).toBe("approved");
    expect(auditTrailStub.logCreate).toHaveBeenCalledWith(
      expect.objectContaining({ entity: "FormulaTemplate", entityId: "frm-1", origin: "formulas.create" }),
    );
    expect(auditTrailStub.logHomologation).toHaveBeenCalledWith(
      expect.objectContaining({ entity: "FormulaTemplate", entityId: "frm-1", origin: "formulas.approve" }),
    );
  });
});

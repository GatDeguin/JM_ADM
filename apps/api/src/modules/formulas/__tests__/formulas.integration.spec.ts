import { describe, expect, it, vi } from "vitest";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { FormulasService } from "../application/formulas.service";

describe("formulas integration", () => {
  it("falla detalle cuando no existe", async () => {
    const service = new FormulasService({ findById: async () => null } as never);
    await expect(service.detail("missing")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("controla conflicto por código duplicado", async () => {
    const service = new FormulasService(
      {
        create: async () => {
          throw { code: "P2002" };
        },
      } as never,
    );

    await expect(service.create("F-1", "Formula")).rejects.toBeInstanceOf(ConflictException);
  });

  it("crea y aprueba fórmula auditando trazabilidad", async () => {
    const repositoryStub = {
      create: vi.fn(async () => ({ id: "frm-1", code: "F-100", name: "Base", status: "draft" })),
      findById: vi.fn(async () => ({ id: "frm-1", code: "F-100", name: "Base", status: "draft", FormulaVersion: [] })),
      approve: vi.fn(async () => ({ id: "frm-1", code: "F-100", name: "Base", status: "approved" })),
    };
    const auditTrailStub = {
      logCreate: vi.fn(async () => undefined),
      logHomologation: vi.fn(async () => undefined),
      logUpdate: vi.fn(async () => undefined),
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

  it("permite crear versión válida y la deja aprobada", async () => {
    const repositoryStub = {
      findById: vi.fn(async () => ({ id: "frm-1", status: "approved", FormulaVersion: [] })),
      findUnits: vi.fn(async () => [{ id: "u-kg", status: "active" }]),
      createVersion: vi.fn(async () => ({
        id: "fv-2",
        templateId: "frm-1",
        version: 2,
        status: "draft",
        FormulaComponent: [{ itemId: "it-1", qty: 2, unitId: "u-kg" }],
        FormulaStep: [{ stepNo: 1, instruction: "Mezclar" }],
      })),
      approveVersion: vi.fn(async () => ({ id: "fv-2", templateId: "frm-1", version: 2, status: "approved" })),
    };
    const auditTrailStub = {
      logCreate: vi.fn(async () => undefined),
      logHomologation: vi.fn(async () => undefined),
      logUpdate: vi.fn(async () => undefined),
    };
    const service = new FormulasService(repositoryStub as never, auditTrailStub);

    const result = await service.createVersion("frm-1", {
      approvedBy: "usr-qa",
      components: [{ itemId: "it-1", qty: 2, unitId: "u-kg" }],
      steps: [{ stepNo: 1, instruction: "Mezclar" }],
    });

    expect(result.event).toBe("formula.version.created");
    expect(result.formulaVersion.status).toBe("approved");
    expect(repositoryStub.approveVersion).toHaveBeenCalledWith("frm-1", "fv-2", "usr-qa");
  });

  it("bloquea crear versión sin componentes o con unidades inválidas", async () => {
    const repositoryStub = {
      findById: vi.fn(async () => ({ id: "frm-1", status: "approved", FormulaVersion: [] })),
      findUnits: vi.fn(async () => [{ id: "u-inactive", status: "inactive" }]),
    };
    const service = new FormulasService(repositoryStub as never);

    await expect(service.createVersion("frm-1", { components: [], steps: [] })).rejects.toBeInstanceOf(ConflictException);

    await expect(
      service.createVersion("frm-1", {
        components: [{ itemId: "it-1", qty: 1, unitId: "u-inactive" }],
        steps: [{ stepNo: 1, instruction: "Paso" }],
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("bloquea obsolescencia sobre versión no aprobada", async () => {
    const repositoryStub = {
      findById: vi.fn(async () => ({
        id: "frm-1",
        status: "approved",
        FormulaVersion: [{ id: "fv-3", status: "draft" }],
      })),
      findVersionById: vi.fn(async () => ({ id: "fv-3", templateId: "frm-1", status: "draft" })),
    };

    const service = new FormulasService(repositoryStub as never);
    await expect(service.obsoleteVersion("frm-1", "fv-3")).rejects.toBeInstanceOf(ConflictException);
  });
});

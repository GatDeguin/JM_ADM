import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { ProductionService } from "../application/production.service";
import { integrationFixtures } from "../../../test-data/integration-fixtures";

describe("production integration", () => {
  it("bloquea creación con fórmula obsoleta", async () => {
    const service = new ProductionService({
      findFormulaVersion: async () => ({ id: integrationFixtures.formulas.obsoleteFormulaId, status: "obsolete" }),
    } as never);

    await expect(
      service.create(
        integrationFixtures.production.orderCode,
        integrationFixtures.production.productBaseId,
        integrationFixtures.formulas.obsoleteFormulaId,
        10,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("crea OP válida y calcula materiales teóricos", async () => {
    const repositoryStub = {
      findFormulaVersion: vi.fn(async () => ({ id: "frm-active-v1", status: "approved" })),
      createOrder: vi.fn(async () => ({ id: "op-1", code: "OP-1", status: "planned" })),
      calculateTheoreticalMaterials: vi.fn(async () => undefined),
    };
    const service = new ProductionService(repositoryStub as never);

    const order = await service.create("OP-1", "pb-1", "frm-active-v1", 120);

    expect(order.status).toBe("planned");
    expect(repositoryStub.calculateTheoreticalMaterials).toHaveBeenCalledWith("op-1");
  });

  it("bloquea cierre de lote sin responsable o sin output", async () => {
    const service = new ProductionService({ closeBatch: async () => ({}) } as never);

    await expect(
      service.close("batch-1", { responsible: "", consumptions: [], wastes: [], outputs: [{ itemId: "itm-1", qty: 10 }] }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.close("batch-1", { responsible: "usr-1", consumptions: [], wastes: [], outputs: [] }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("cierra lote y devuelve evento de trazabilidad", async () => {
    const repositoryStub = {
      recordBatchExecution: vi.fn(async () => undefined),
    };
    const service = new ProductionService(repositoryStub as never);

    const result = await service.close("batch-1", {
      responsible: "usr-1",
      consumptions: [{ itemId: "rm-1", plannedQty: 10, actualQty: 10 }],
      wastes: [{ reason: "evaporación", qty: 1 }],
      outputs: [{ itemId: "fg-1", qty: 9 }],
    });

    expect(result.event).toBe("production.batch.closed");
    expect(repositoryStub.recordBatchExecution).toHaveBeenCalledWith(
      "batch-1",
      "usr-1",
      expect.objectContaining({ outputs: [{ itemId: "fg-1", qty: 9 }] }),
    );
  });

  it("bloquea fraccionamiento cuando el lote está retenido", async () => {
    const service = new ProductionService({
      findBatch: async () => ({ id: integrationFixtures.production.batchRetainedId, status: "retained" }),
    } as never);

    await expect(service.fractionate(integrationFixtures.production.batchRetainedId, 12, "sku-1", [{ lotCode: "CH-1", qty: 12 }])).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("fracciona lote liberado y valida sumatoria", async () => {
    const repositoryStub = {
      findBatch: vi.fn(async () => ({ id: "batch-1", status: "released" })),
      createFractionation: vi.fn(async () => ({ id: "pk-1" })),
    };
    const service = new ProductionService(repositoryStub as never);

    await expect(service.fractionate("batch-1", 10, "sku-1", [{ lotCode: "C1", qty: 6 }, { lotCode: "C2", qty: 3 }])).rejects.toBeInstanceOf(
      ConflictException,
    );

    const result = await service.fractionate("batch-1", 10, "sku-1", [{ lotCode: "C1", qty: 6 }, { lotCode: "C2", qty: 4 }]);

    expect(result.event).toBe("production.batch.fractionated");
    expect(repositoryStub.createFractionation).toHaveBeenCalledWith("batch-1", "sku-1", 10, [
      { lotCode: "C1", qty: 6 },
      { lotCode: "C2", qty: 4 },
    ]);
  });

  it("rechaza liberar lote sin QC aprobado", async () => {
    const service = new ProductionService({
      findBatch: async () => ({ id: "batch-1", status: "closed" }),
      findLatestQc: async () => ({ decision: "rejected" }),
    } as never);

    await expect(service.releaseBatch("batch-1")).rejects.toBeInstanceOf(ConflictException);
  });

  it("rechaza reserva para OP inexistente", async () => {
    const service = new ProductionService({ findOrder: async () => null } as never);
    await expect(service.reserveMaterials("op-missing")).rejects.toBeInstanceOf(NotFoundException);
  });
});

import { BadRequestException, ConflictException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
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

  it("bloquea cierre de lote sin responsable o sin output", async () => {
    const service = new ProductionService({ closeBatch: async () => ({}) } as never);

    await expect(
      service.close("batch-1", { responsible: "", consumptions: [], wastes: [], outputs: [{ itemId: "itm-1", qty: 10 }] }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.close("batch-1", { responsible: "usr-1", consumptions: [], wastes: [], outputs: [] }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("bloquea fraccionamiento cuando el lote está retenido", async () => {
    const service = new ProductionService({
      findBatch: async () => ({ id: integrationFixtures.production.batchRetainedId, status: "retained" }),
    } as never);

    await expect(service.fractionate(integrationFixtures.production.batchRetainedId, 12, "sku-1", [{ lotCode: "CH-1", qty: 12 }])).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});

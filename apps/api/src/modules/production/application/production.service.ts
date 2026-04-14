import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import {
  assertBatchCanBeFractionated,
  assertFormulaCanBeUsed,
  assertPositiveNumber,
  assertRequiredText,
} from "../../../common/domain-rules/shared-domain-rules";
import { ProductionRepository } from "../infrastructure/production.repository";

type BatchExecutionInput = {
  responsible: string;
  consumptions: Array<{ itemId: string; plannedQty: number; actualQty: number }>;
  wastes: Array<{ reason: string; qty: number }>;
  outputs: Array<{ itemId: string; qty: number }>;
};

@Injectable()
export class ProductionService {
  constructor(private readonly productionRepository: ProductionRepository) {}

  list() {
    return this.productionRepository.listOrders();
  }

  async create(code: string, productBaseId: string, formulaVersionId: string, plannedQty: number) {
    assertPositiveNumber(plannedQty, "La cantidad planificada");
    const formulaVersion = await this.productionRepository.findFormulaVersion(formulaVersionId);
    assertFormulaCanBeUsed(formulaVersion?.status);
    try {
      const order = await this.productionRepository.createOrder(code, productBaseId, formulaVersionId, plannedQty);
      await this.productionRepository.calculateTheoreticalMaterials(order.id);
      return order;
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
        throw new ConflictException("El código de orden de producción ya existe");
      }
      throw error;
    }
  }

  async reserveMaterials(id: string) {
    const order = await this.productionRepository.findOrder(id);
    if (!order) {
      throw new NotFoundException("Orden de producción no encontrada");
    }
    await this.productionRepository.reserveMaterials(id);
    return { event: "production.materials.reserved", id };
  }

  async start(id: string) {
    const order = await this.productionRepository.findOrder(id);
    if (!order) {
      throw new NotFoundException("Orden de producción no encontrada");
    }
    const batch = await this.productionRepository.startBatch(id);
    return { event: "production.order.started", id, batchId: batch.id, batchCode: batch.code };
  }

  async close(id: string, payload: BatchExecutionInput) {
    const responsible = assertRequiredText(payload.responsible, "el responsable");
    if (!payload.outputs.length) {
      throw new ConflictException("Debes informar al menos un output real para cerrar el lote.");
    }

    for (const consumption of payload.consumptions) {
      assertPositiveNumber(consumption.actualQty, "El consumo real");
      assertPositiveNumber(consumption.plannedQty, "El consumo teórico");
    }
    for (const waste of payload.wastes) {
      assertPositiveNumber(waste.qty, "La merma");
      assertRequiredText(waste.reason, "el motivo de merma");
    }
    for (const output of payload.outputs) {
      assertPositiveNumber(output.qty, "La cantidad de salida");
    }

    await this.productionRepository.recordBatchExecution(id, responsible, payload);
    return { event: "production.batch.closed", id };
  }

  async releaseBatch(id: string) {
    const batch = await this.productionRepository.findBatch(id);
    if (!batch) {
      throw new NotFoundException("Batch no encontrado");
    }
    const latestQc = await this.productionRepository.findLatestQc(batch.id);
    if (!latestQc || latestQc.decision !== "approved") {
      throw new ConflictException("No se puede liberar el lote sin QC aprobado.");
    }

    await this.productionRepository.releaseBatch(id);
    return { event: "quality.batch.released", id };
  }

  async fractionate(batchId: string, qty: number, skuId: string, childLots: Array<{ lotCode: string; qty: number }>) {
    assertPositiveNumber(qty, "La cantidad a fraccionar");
    const batch = await this.productionRepository.findBatch(batchId);
    if (!batch) {
      throw new NotFoundException("Batch no encontrado");
    }
    assertBatchCanBeFractionated(batch.status);
    if (batch.status !== "released") {
      throw new ConflictException("Sólo se puede fraccionar un lote madre en estado released.");
    }
    if (!childLots.length) {
      throw new ConflictException("Debes informar al menos un lote hijo para fraccionar.");
    }

    const childTotal = childLots.reduce((acc, lot) => acc + lot.qty, 0);
    if (Math.abs(childTotal - qty) > 0.0001) {
      throw new ConflictException("La suma de los lotes hijo debe coincidir con la cantidad a fraccionar.");
    }

    const order = await this.productionRepository.createFractionation(batchId, skuId, qty, childLots);
    return { event: "production.batch.fractionated", batchId, packagingOrderId: order.id, qty };
  }

  async traceTimeline(batchId: string) {
    return this.productionRepository.getBatchTimeline(batchId);
  }
}

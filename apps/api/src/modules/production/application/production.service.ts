import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import {
  assertBatchCanBeFractionated,
  assertFormulaCanBeUsed,
  assertPositiveNumber,
  assertRequiredText,
} from "../../../common/domain-rules/shared-domain-rules";
import { ProductionRepository } from "../infrastructure/production.repository";

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
      return await this.productionRepository.createOrder(code, productBaseId, formulaVersionId, plannedQty);
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
        throw new ConflictException("El código de orden de producción ya existe");
      }
      throw error;
    }
  }

  async start(id: string) {
    const order = await this.productionRepository.findOrder(id);
    if (!order) {
      throw new NotFoundException("Orden de producción no encontrada");
    }
    return { event: "production.order.started", id };
  }

  async close(id: string, responsible: string, outputQty: number) {
    assertRequiredText(responsible, "el responsable");
    assertPositiveNumber(outputQty, "La cantidad de salida");
    await this.productionRepository.closeBatch(id, responsible, outputQty);
    return { event: "production.batch.closed", id, outputQty };
  }

  async fractionate(batchId: string, qty: number) {
    assertPositiveNumber(qty, "La cantidad a fraccionar");
    const batch = await this.productionRepository.findBatch(batchId);
    if (!batch) {
      throw new NotFoundException("Batch no encontrado");
    }
    assertBatchCanBeFractionated(batch.status);
    return { event: "production.batch.fractionated", batchId, qty };
  }
}

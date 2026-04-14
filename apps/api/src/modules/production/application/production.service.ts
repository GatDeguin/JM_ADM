import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { ProductionRepository } from "../infrastructure/production.repository";

@Injectable()
export class ProductionService {
  constructor(private readonly productionRepository: ProductionRepository) {}

  list() {
    return this.productionRepository.listOrders();
  }

  async create(code: string, productBaseId: string, formulaVersionId: string, plannedQty: number) {
    if (plannedQty <= 0) {
      throw new BadRequestException("plannedQty debe ser mayor que cero");
    }
    const formulaVersion = await this.productionRepository.findFormulaVersion(formulaVersionId);
    if (formulaVersion?.status === "obsolete") {
      throw new BadRequestException("formula obsolete");
    }
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
    if (!responsible) {
      throw new BadRequestException("responsible required");
    }
    if (outputQty <= 0) {
      throw new BadRequestException("output required");
    }
    await this.productionRepository.closeBatch(id, responsible, outputQty);
    return { event: "production.batch.closed", id, outputQty };
  }

  async fractionate(batchId: string, qty: number) {
    if (qty <= 0) {
      throw new BadRequestException("qty must be > 0");
    }
    const batch = await this.productionRepository.findBatch(batchId);
    if (!batch) {
      throw new NotFoundException("Batch no encontrado");
    }
    if (batch.status === "retained") {
      throw new ConflictException("retained batch cannot be fractionated");
    }
    return { event: "production.batch.fractionated", batchId, qty };
  }
}

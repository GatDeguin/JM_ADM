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

  async close(id: string, responsible: string) {
    if (!responsible) {
      throw new BadRequestException("responsible required");
    }
    return { event: "production.batch.closed", id };
  }
}

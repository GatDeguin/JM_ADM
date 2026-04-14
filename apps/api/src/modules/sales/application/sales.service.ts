import { BadRequestException, ConflictException, ForbiddenException, Injectable } from "@nestjs/common";
import { SalesRepository } from "../infrastructure/sales.repository";

@Injectable()
export class SalesService {
  constructor(private readonly salesRepository: SalesRepository) {}

  list() {
    return this.salesRepository.listOrders();
  }

  async create(code: string, customerId: string, priceListId: string, total: number, items: Array<{ skuId: string; qty: number }>) {
    if (!customerId) {
      throw new BadRequestException("customer required");
    }

    if (!items?.length) {
      throw new BadRequestException("sku required");
    }

    if (total <= 0) {
      throw new ForbiddenException("No se permiten pedidos con total <= 0");
    }

    try {
      const order = await this.salesRepository.createOrder(code, customerId, priceListId, total);
      return { event: "sales.order.confirmed", order };
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
        throw new ConflictException("El código de orden de venta ya existe");
      }
      throw error;
    }
  }
}

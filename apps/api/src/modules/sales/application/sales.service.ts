import { ConflictException, Injectable } from "@nestjs/common";
import {
  assertOrderHasItems,
  assertRequiredText,
  assertSalesTotalAllowed,
} from "../../../common/domain-rules/shared-domain-rules";
import { SalesRepository } from "../infrastructure/sales.repository";

@Injectable()
export class SalesService {
  constructor(private readonly salesRepository: SalesRepository) {}

  list() {
    return this.salesRepository.listOrders();
  }

  async create(code: string, customerId: string, priceListId: string, total: number, items: Array<{ skuId: string; qty: number }>) {
    assertRequiredText(customerId, "el cliente");
    assertRequiredText(priceListId, "la lista de precios");
    assertOrderHasItems(items);
    assertSalesTotalAllowed(total);

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

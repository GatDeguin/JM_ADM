import { BadRequestException, ConflictException, HttpStatus, Injectable } from "@nestjs/common";
import { throwDomainError } from "../../../common/domain-rules/domain-errors";
import {
  assertRequiredText,
  assertSalesTotalAllowed,
} from "../../../common/domain-rules/shared-domain-rules";
import { SalesRepository } from "../infrastructure/sales.repository";

type SalesItemInput = { skuId?: string; comboId?: string; qty: number };
type DispatchInput = { code: string; salesOrderId: string; items: Array<{ skuId: string; qty: number }> };
type ReturnInput = { code: string; salesOrderId: string; reason: string };

@Injectable()
export class SalesService {
  constructor(private readonly salesRepository: SalesRepository) {}

  list() {
    return this.salesRepository.listOrders();
  }

  async create(code: string, customerId: string, priceListId: string, total: number, items: SalesItemInput[]) {
    assertRequiredText(customerId, "el cliente");
    assertRequiredText(priceListId, "la lista de precios");
    if (!items.length) {
      throwDomainError("RULE_SALES_ITEMS_REQUIRED", "El pedido debe incluir al menos un ítem.", HttpStatus.BAD_REQUEST, "R-SA-001");
    }
    if (!Number.isFinite(total) || total <= 0) {
      throwDomainError("RULE_SALES_TOTAL_POSITIVE", "El pedido no se puede confirmar con total menor o igual a 0.", HttpStatus.FORBIDDEN, "R-SA-002");
    }
    assertSalesTotalAllowed(total);

    const [customerExists, priceListExists] = await Promise.all([
      this.salesRepository.customerExists(customerId),
      this.salesRepository.priceListExists(priceListId),
    ]);

    if (!customerExists) {
      throw new BadRequestException("Cliente inválido para el pedido");
    }
    if (!priceListExists) {
      throw new BadRequestException("Lista de precios inválida para el pedido");
    }

    const explodedItems = await this.explodeItems(items);
    const skuIds = [...new Set(explodedItems.map((item) => item.skuId))];
    const validSkus = await this.salesRepository.getExistingSkuIds(skuIds);

    if (validSkus.length !== skuIds.length) {
      throw new BadRequestException("El pedido contiene SKU inexistentes");
    }

    try {
      const order = await this.salesRepository.createOrder({
        code,
        customerId,
        priceListId,
        total,
        items: explodedItems,
      });
      return { event: "sales.order.confirmed", order, explodedItemsCount: explodedItems.length };
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
        throw new ConflictException("El código de orden de venta ya existe");
      }
      throw error;
    }
  }

  dispatch(payload: DispatchInput) {
    return this.salesRepository.createDispatch(payload);
  }

  registerReturn(payload: ReturnInput) {
    return this.salesRepository.createReturn(payload);
  }

  private async explodeItems(items: SalesItemInput[]) {
    const exploded: Array<{ skuId: string; qty: number }> = [];

    for (const item of items) {
      if (!Number.isFinite(item.qty) || item.qty <= 0) {
        throw new BadRequestException("Cada ítem debe tener cantidad mayor a 0");
      }

      if (item.skuId) {
        exploded.push({ skuId: item.skuId, qty: item.qty });
        continue;
      }

      if (!item.comboId) {
        throw new BadRequestException("Cada ítem debe incluir skuId o comboId");
      }

      const comboItems = await this.salesRepository.findComboComponents(item.comboId);
      if (!comboItems.length) {
        throw new BadRequestException(`El combo ${item.comboId} no tiene componentes`);
      }

      comboItems.forEach((component: { skuId: string; qty: number | string }) => {
        exploded.push({ skuId: component.skuId, qty: Number(component.qty) * item.qty });
      });
    }

    return exploded;
  }
}

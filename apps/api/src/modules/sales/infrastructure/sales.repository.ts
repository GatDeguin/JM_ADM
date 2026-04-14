import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";

type CreateOrderInput = {
  code: string;
  customerId: string;
  priceListId: string;
  total: number;
  items: Array<{ skuId: string; qty: number }>;
};

type DispatchInput = { code: string; salesOrderId: string; items: Array<{ skuId: string; qty: number }> };
type ReturnInput = { code: string; salesOrderId: string; reason: string };

@Injectable()
export class SalesRepository {
  constructor(private readonly prisma: PrismaService) {}

  listOrders() {
    return this.prisma.salesOrder.findMany({ orderBy: { code: "desc" }, include: { SalesOrderItem: true } });
  }

  async customerExists(customerId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId }, select: { id: true } });
    return Boolean(customer);
  }

  async priceListExists(priceListId: string) {
    const priceList = await this.prisma.priceList.findUnique({ where: { id: priceListId }, select: { id: true } });
    return Boolean(priceList);
  }

  async getExistingSkuIds(skuIds: string[]) {
    const skus = await this.prisma.sKU.findMany({ where: { id: { in: skuIds } }, select: { id: true } });
    return skus.map((sku: { id: string }) => sku.id);
  }

  findComboComponents(comboId: string) {
    return this.prisma.comboPackItem.findMany({ where: { comboId }, select: { skuId: true, qty: true } });
  }

  createOrder(input: CreateOrderInput) {
    return this.prisma.$transaction(async (tx: any) => {
      const order = await tx.salesOrder.create({
        data: {
          code: input.code,
          customerId: input.customerId,
          priceListId: input.priceListId,
          total: input.total,
          status: "confirmed",
          SalesOrderItem: {
            create: input.items.map((item) => ({ skuId: item.skuId, qty: item.qty, unitPrice: 0 })),
          },
        },
        include: { SalesOrderItem: true },
      });

      const skuIds = [...new Set(input.items.map((item) => item.skuId))];
      const packaging = await tx.packagingSpec.findMany({ where: { skuId: { in: skuIds } }, select: { skuId: true, itemId: true } });
      const itemBySku = new Map(packaging.map((row: { skuId: string; itemId: string }) => [row.skuId, row.itemId]));

      await Promise.all(
        input.items
          .map((item) => {
            const itemId = itemBySku.get(item.skuId);
            if (!itemId) return null;
            return tx.stockReservation.create({
              data: {
                itemId,
                referenceType: "sales_order",
                referenceId: order.id,
                qty: item.qty,
              },
            });
          })
          .filter(Boolean),
      );

      return order;
    });
  }

  createDispatch(payload: DispatchInput) {
    return this.prisma.dispatchOrder.create({
      data: {
        code: payload.code,
        salesOrderId: payload.salesOrderId,
        status: "dispatched",
        DispatchItem: {
          create: payload.items.map((item) => ({ skuId: item.skuId, qty: item.qty })),
        },
      },
      include: { DispatchItem: true },
    });
  }

  createReturn(payload: ReturnInput) {
    return this.prisma.salesReturn.create({
      data: payload,
    });
  }
}

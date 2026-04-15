import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import {
  ActionPurchaseOrderInput,
  CreateGoodsReceiptInput,
  CreatePurchaseOrderInput,
  CreatePurchaseRequestInput,
  GoodsReceiptDifference,
  GoodsReceiptDto,
  PurchaseOrderDto,
  PurchaseRequestDto,
  UpdatePurchaseOrderInput,
  UpdatePurchaseRequestInput,
} from "../domain/purchasing.types";

const purchaseRequestInclude = {
  PurchaseRequestItem: { include: { item: { select: { id: true, code: true, name: true } } } },
} as const;

const purchaseOrderInclude = {
  supplier: { select: { id: true, code: true, name: true, status: true } },
  PurchaseOrderItem: { include: { item: { select: { id: true, code: true, name: true } } } },
} as const;

const goodsReceiptInclude = {
  purchaseOrder: { include: { PurchaseOrderItem: true } },
  GoodsReceiptItem: true,
} as const;

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "object" && value !== null && "toString" in value) return Number(String(value));
  return Number(value ?? 0);
}

function normalizeRequest(entity: any): PurchaseRequestDto {
  return {
    id: entity.id,
    code: entity.code,
    status: entity.status,
    items: (entity.PurchaseRequestItem ?? []).map((row: any) => ({
      id: row.id,
      itemId: row.itemId,
      qty: row.qty,
      item: row.item,
    })),
  };
}

function normalizeOrder(entity: any): PurchaseOrderDto {
  return {
    id: entity.id,
    code: entity.code,
    supplierId: entity.supplierId,
    status: entity.status,
    supplier: entity.supplier,
    items: (entity.PurchaseOrderItem ?? []).map((row: any) => ({
      id: row.id,
      itemId: row.itemId,
      qty: row.qty,
      unitCost: row.unitCost,
      item: row.item,
    })),
  };
}

@Injectable()
export class PurchasingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listRequests(): Promise<PurchaseRequestDto[]> {
    const rows = await this.prisma.purchaseRequest.findMany({ orderBy: { id: "desc" }, include: purchaseRequestInclude });
    return rows.map(normalizeRequest);
  }

  async getRequest(id: string): Promise<PurchaseRequestDto> {
    const row = await this.prisma.purchaseRequest.findUniqueOrThrow({ where: { id }, include: purchaseRequestInclude });
    return normalizeRequest(row);
  }

  async createRequest(data: CreatePurchaseRequestInput): Promise<PurchaseRequestDto> {
    const row = await this.prisma.purchaseRequest.create({
      data: {
        code: data.code,
        status: data.status ?? "draft",
        PurchaseRequestItem: { create: data.items.map((item) => ({ itemId: item.itemId, qty: item.qty })) },
      } as any,
      include: purchaseRequestInclude,
    });
    return normalizeRequest(row);
  }

  async updateRequest(id: string, data: UpdatePurchaseRequestInput): Promise<PurchaseRequestDto> {
    const row = await this.prisma.purchaseRequest.update({ where: { id }, data: data as any, include: purchaseRequestInclude });
    return normalizeRequest(row);
  }

  async approveRequest(id: string): Promise<PurchaseRequestDto> {
    const row = await this.prisma.purchaseRequest.update({ where: { id }, data: { status: "approved" }, include: purchaseRequestInclude });
    return normalizeRequest(row);
  }

  async listOrders(): Promise<PurchaseOrderDto[]> {
    const rows = await this.prisma.purchaseOrder.findMany({ orderBy: { id: "desc" }, include: purchaseOrderInclude });
    return rows.map(normalizeOrder);
  }

  async getOrder(id: string): Promise<PurchaseOrderDto> {
    const row = await this.prisma.purchaseOrder.findUniqueOrThrow({ where: { id }, include: purchaseOrderInclude });
    return normalizeOrder(row);
  }

  async createOrder(data: CreatePurchaseOrderInput): Promise<PurchaseOrderDto> {
    return this.prisma.$transaction(async (tx: any) => {
      if (data.requestId) {
        const request = await tx.purchaseRequest.findUniqueOrThrow({ where: { id: data.requestId } });
        if (request.status !== "approved") {
          throw new BadRequestException("La solicitud de compra debe estar aprobada para generar una OC");
        }
      }

      const order = await tx.purchaseOrder.create({
        data: {
          code: data.code,
          supplierId: data.supplierId,
          status: data.status ?? "draft",
          PurchaseOrderItem: { create: data.items.map((item) => ({ itemId: item.itemId, qty: item.qty, unitCost: item.unitCost })) },
        } as any,
        include: purchaseOrderInclude,
      });

      return normalizeOrder(order);
    });
  }

  async updateOrder(id: string, data: UpdatePurchaseOrderInput): Promise<PurchaseOrderDto> {
    const row = await this.prisma.purchaseOrder.update({ where: { id }, data: data as any, include: purchaseOrderInclude });
    return normalizeOrder(row);
  }

  async removeOrder(id: string): Promise<PurchaseOrderDto> {
    const row = await this.prisma.purchaseOrder.update({ where: { id }, data: { status: "cancelled" }, include: purchaseOrderInclude });
    return normalizeOrder(row);
  }

  async runOrderAction(id: string, payload: ActionPurchaseOrderInput): Promise<PurchaseOrderDto> {
    const nextStatus = payload.action === "confirm" ? "confirmed" : "approved";
    const row = await this.prisma.purchaseOrder.update({ where: { id }, data: { status: nextStatus }, include: purchaseOrderInclude });
    return normalizeOrder(row);
  }

  async listReceipts(): Promise<GoodsReceiptDto[]> {
    const rows = await this.prisma.goodsReceipt.findMany({ orderBy: { id: "desc" }, include: goodsReceiptInclude });
    return rows.map((row: any) => this.buildReceiptSummary(row));
  }

  async getReceipt(id: string): Promise<GoodsReceiptDto> {
    const row = await this.prisma.goodsReceipt.findUniqueOrThrow({ where: { id }, include: goodsReceiptInclude });
    return this.buildReceiptSummary(row);
  }

  async createReceipt(data: CreateGoodsReceiptInput): Promise<GoodsReceiptDto> {
    return this.prisma.$transaction(async (tx: any) => {
      const order = await tx.purchaseOrder.findUniqueOrThrow({ where: { id: data.purchaseOrderId }, include: { PurchaseOrderItem: true } });
      if (!["approved", "confirmed", "received_partial"].includes(order.status)) {
        throw new BadRequestException("La OC debe estar aprobada/confirmada para recibir mercadería");
      }

      const historicalReceipts = await tx.goodsReceipt.findMany({
        where: { purchaseOrderId: data.purchaseOrderId },
        include: { GoodsReceiptItem: true },
      });
      const cumulativeAccepted = new Map<string, number>();
      for (const receipt of historicalReceipts) {
        for (const line of receipt.GoodsReceiptItem) {
          cumulativeAccepted.set(line.itemId, (cumulativeAccepted.get(line.itemId) ?? 0) + toNumber(line.acceptedQty));
        }
      }

      const orderItemById = new Map<string, any>(order.PurchaseOrderItem.map((line: any) => [line.itemId, line]));
      for (const line of data.items) {
        const orderLine = orderItemById.get(line.itemId);
        if (!orderLine) throw new BadRequestException(`El ítem ${line.itemId} no existe en la OC`);
        if (line.acceptedQty > line.qty) throw new BadRequestException("La cantidad aceptada no puede superar la recibida");

        const nextAccepted = (cumulativeAccepted.get(line.itemId) ?? 0) + line.acceptedQty;
        if (nextAccepted > toNumber(orderLine.qty)) {
          throw new BadRequestException(`La recepción del ítem ${line.itemId} excede lo ordenado en la OC`);
        }
      }

      const receipt = await tx.goodsReceipt.create({
        data: {
          code: data.code,
          purchaseOrderId: data.purchaseOrderId,
          status: data.status ?? "received_partial",
          GoodsReceiptItem: { create: data.items.map((line) => ({ itemId: line.itemId, qty: line.qty, acceptedQty: line.acceptedQty })) },
        } as any,
        include: { GoodsReceiptItem: true, purchaseOrder: { include: { PurchaseOrderItem: true } } },
      });

      const differences = this.computeDifferences(receipt.purchaseOrder.PurchaseOrderItem, receipt.GoodsReceiptItem, cumulativeAccepted);

      let totalAcceptedCost = 0;
      for (const diff of differences) {
        const orderLine = orderItemById.get(diff.itemId);
        totalAcceptedCost += diff.acceptedQty * toNumber(orderLine?.unitCost ?? 0);

        if (diff.acceptedQty > 0) {
          await tx.stockMovement.create({
            data: {
              itemId: diff.itemId,
              type: "purchase_receipt",
              qty: diff.acceptedQty,
              reason: `Ingreso por recepción ${receipt.code}`,
            },
          });

          const existingBalance = await tx.stockBalance.findFirst({ where: { itemId: diff.itemId, warehouseId: null, locationId: null } });
          if (existingBalance) {
            await tx.stockBalance.update({ where: { id: existingBalance.id }, data: { qtyOnHand: { increment: diff.acceptedQty as never } } });
          } else {
            await tx.stockBalance.create({ data: { itemId: diff.itemId, qtyOnHand: diff.acceptedQty, qtyReserved: 0 } });
          }
        }
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const payable = await tx.accountsPayable.create({
        data: {
          supplierId: order.supplierId,
          sourceType: "goods_receipt",
          sourceId: receipt.id,
          dueDate,
          amount: totalAcceptedCost,
          balance: totalAcceptedCost,
          status: "open",
        },
      });

      const remainingAfterThisReceipt = await this.remainingQtyByOrder(tx, order.id);
      const poStatus = remainingAfterThisReceipt > 0 ? "received_partial" : "received_total";
      await tx.purchaseOrder.update({ where: { id: order.id }, data: { status: poStatus } });
      await tx.goodsReceipt.update({ where: { id: receipt.id }, data: { status: poStatus } });

      return {
        id: receipt.id,
        code: receipt.code,
        purchaseOrderId: receipt.purchaseOrderId,
        status: poStatus,
        differencesVsOrder: differences,
        accountsPayableId: payable.id,
        accountsPayableAmount: totalAcceptedCost,
      };
    });
  }

  private async remainingQtyByOrder(tx: any, purchaseOrderId: string): Promise<number> {
    const order = await tx.purchaseOrder.findUniqueOrThrow({ where: { id: purchaseOrderId }, include: { PurchaseOrderItem: true, GoodsReceipt: { include: { GoodsReceiptItem: true } } } });

    let remaining = 0;
    for (const line of order.PurchaseOrderItem) {
      const accepted = order.GoodsReceipt.flatMap((gr: any) => gr.GoodsReceiptItem).filter((it: any) => it.itemId === line.itemId).reduce((sum: number, it: any) => sum + toNumber(it.acceptedQty), 0);
      remaining += Math.max(toNumber(line.qty) - accepted, 0);
    }

    return remaining;
  }

  private computeDifferences(orderItems: any[], receiptItems: any[], cumulativeAccepted: Map<string, number>): GoodsReceiptDifference[] {
    const receivedByItem = new Map<string, any>(receiptItems.map((line) => [line.itemId, line]));
    return orderItems.map((orderLine) => {
      const received = receivedByItem.get(orderLine.itemId);
      const orderedQty = toNumber(orderLine.qty);
      const previouslyAcceptedQty = cumulativeAccepted.get(orderLine.itemId) ?? 0;
      const receivedQty = toNumber(received?.qty ?? 0);
      const acceptedQty = toNumber(received?.acceptedQty ?? 0);
      return {
        itemId: orderLine.itemId,
        orderedQty,
        previouslyAcceptedQty,
        receivedQty,
        acceptedQty,
        rejectedQty: Math.max(receivedQty - acceptedQty, 0),
        remainingQtyVsOrder: Math.max(orderedQty - (previouslyAcceptedQty + acceptedQty), 0),
      };
    });
  }

  private buildReceiptSummary(entity: any): GoodsReceiptDto {
    const cumulativeAccepted = new Map<string, number>();
    const differences = this.computeDifferences(entity.purchaseOrder.PurchaseOrderItem, entity.GoodsReceiptItem, cumulativeAccepted);
    return {
      id: entity.id,
      code: entity.code,
      purchaseOrderId: entity.purchaseOrderId,
      status: entity.status,
      differencesVsOrder: differences,
    };
  }
}

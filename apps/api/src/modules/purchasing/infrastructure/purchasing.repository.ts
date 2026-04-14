import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionPurchaseOrderInput, CreatePurchaseOrderInput, PurchaseOrderDto, UpdatePurchaseOrderInput } from "../domain/purchasing.types";

const purchaseOrderInclude = {
  supplier: { select: { id: true, code: true, name: true, status: true } },
} as const;

@Injectable()
export class PurchasingRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<PurchaseOrderDto[]> {
    return this.prisma.purchaseOrder.findMany({ orderBy: { id: "desc" }, include: purchaseOrderInclude }) as Promise<PurchaseOrderDto[]>;
  }

  get(id: string): Promise<PurchaseOrderDto> {
    return this.prisma.purchaseOrder.findUniqueOrThrow({ where: { id }, include: purchaseOrderInclude }) as Promise<PurchaseOrderDto>;
  }

  create(data: CreatePurchaseOrderInput): Promise<PurchaseOrderDto> {
    return this.prisma.purchaseOrder.create({ data: data as any, include: purchaseOrderInclude }) as Promise<PurchaseOrderDto>;
  }

  update(id: string, data: UpdatePurchaseOrderInput): Promise<PurchaseOrderDto> {
    return this.prisma.purchaseOrder.update({ where: { id }, data: data as any, include: purchaseOrderInclude }) as Promise<PurchaseOrderDto>;
  }

  remove(id: string) {
    return this.prisma.purchaseOrder.update({ where: { id }, data: { status: "cancelled" }, include: purchaseOrderInclude });
  }

  runAction(id: string, payload: ActionPurchaseOrderInput): Promise<PurchaseOrderDto> {
    void payload;
    return this.prisma.purchaseOrder.update({ where: { id }, data: { status: "confirmed" }, include: purchaseOrderInclude }) as Promise<PurchaseOrderDto>;
  }
}

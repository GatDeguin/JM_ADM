import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionPurchaseOrderInput, CreatePurchaseOrderInput, PurchaseOrderDto, UpdatePurchaseOrderInput } from "../domain/purchasing.types";

@Injectable()
export class PurchasingRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<PurchaseOrderDto[]> { return this.prisma.purchaseOrder.findMany({ orderBy: { id: "desc" } }) as Promise<PurchaseOrderDto[]>; }
  get(id: string): Promise<PurchaseOrderDto> { return this.prisma.purchaseOrder.findUniqueOrThrow({ where: { id } }) as Promise<PurchaseOrderDto>; }
  create(data: CreatePurchaseOrderInput): Promise<PurchaseOrderDto> { return this.prisma.purchaseOrder.create({ data: data as any }) as Promise<PurchaseOrderDto>; }
  update(id: string, data: UpdatePurchaseOrderInput): Promise<PurchaseOrderDto> { return this.prisma.purchaseOrder.update({ where: { id }, data: data as any }) as Promise<PurchaseOrderDto>; }
  remove(id: string) { return this.prisma.purchaseOrder.delete({ where: { id } }); }

  runAction(id: string, payload: ActionPurchaseOrderInput): Promise<PurchaseOrderDto> {
    void payload;
    return this.prisma.purchaseOrder.update({ where: { id }, data: { status: "confirmed" } }) as Promise<PurchaseOrderDto>;
  }
}

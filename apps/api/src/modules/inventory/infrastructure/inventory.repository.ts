import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionInventoryAdjustmentInput, CreateInventoryAdjustmentInput, InventoryAdjustmentDto, UpdateInventoryAdjustmentInput } from "../domain/inventory.types";

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<InventoryAdjustmentDto[]> { return this.prisma.inventoryAdjustment.findMany({ orderBy: { id: "desc" } }) as Promise<InventoryAdjustmentDto[]>; }
  get(id: string): Promise<InventoryAdjustmentDto> { return this.prisma.inventoryAdjustment.findUniqueOrThrow({ where: { id } }) as Promise<InventoryAdjustmentDto>; }
  create(data: CreateInventoryAdjustmentInput): Promise<InventoryAdjustmentDto> { return this.prisma.inventoryAdjustment.create({ data: data as any }) as Promise<InventoryAdjustmentDto>; }
  update(id: string, data: UpdateInventoryAdjustmentInput): Promise<InventoryAdjustmentDto> { return this.prisma.inventoryAdjustment.update({ where: { id }, data: data as any }) as Promise<InventoryAdjustmentDto>; }
  remove(id: string) { return this.prisma.inventoryAdjustment.delete({ where: { id } }); }

  runAction(id: string, payload: ActionInventoryAdjustmentInput): Promise<InventoryAdjustmentDto> {
    return this.prisma.$transaction(async (tx: any) => {
      const current = await tx.inventoryAdjustment.findUniqueOrThrow({ where: { id } });
      return tx.inventoryAdjustment.create({ data: { itemId: current.itemId, qty: (Number(current.qty) * -1) as never, reason: payload.reason } }) as Promise<InventoryAdjustmentDto>;
    });
  }
}

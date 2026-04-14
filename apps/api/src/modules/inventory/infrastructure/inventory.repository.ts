import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionInventoryAdjustmentInput, CreateInventoryAdjustmentInput, InventoryAdjustmentDto, UpdateInventoryAdjustmentInput } from "../domain/inventory.types";
import { AuditTrailService } from "../../audit/application/audit-trail.service";

const noopAuditTrail = {
  logCreate: async () => undefined,
  logUpdate: async () => undefined,
  logTransactionalAction: async () => undefined,
};

@Injectable()
export class InventoryRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditTrailService: Pick<AuditTrailService, "logCreate" | "logUpdate" | "logTransactionalAction"> = noopAuditTrail,
  ) {}

  list(): Promise<InventoryAdjustmentDto[]> { return this.prisma.inventoryAdjustment.findMany({ orderBy: { id: "desc" } }) as Promise<InventoryAdjustmentDto[]>; }
  get(id: string): Promise<InventoryAdjustmentDto> { return this.prisma.inventoryAdjustment.findUniqueOrThrow({ where: { id } }) as Promise<InventoryAdjustmentDto>; }
  async create(data: CreateInventoryAdjustmentInput): Promise<InventoryAdjustmentDto> {
    const created = await this.prisma.inventoryAdjustment.create({ data: data as any }) as InventoryAdjustmentDto;
    await this.auditTrailService.logCreate({ entity: "InventoryAdjustment", entityId: created.id, origin: "inventory.create", after: created });
    return created;
  }
  async update(id: string, data: UpdateInventoryAdjustmentInput): Promise<InventoryAdjustmentDto> {
    const previous = await this.prisma.inventoryAdjustment.findUniqueOrThrow({ where: { id } });
    const updated = await this.prisma.inventoryAdjustment.update({ where: { id }, data: data as any }) as InventoryAdjustmentDto;
    await this.auditTrailService.logUpdate({ entity: "InventoryAdjustment", entityId: id, origin: "inventory.update", before: previous, after: updated });
    return updated;
  }
  remove(id: string) { return this.prisma.inventoryAdjustment.delete({ where: { id } }); }

  runAction(id: string, payload: ActionInventoryAdjustmentInput): Promise<InventoryAdjustmentDto> {
    return this.prisma.$transaction(async (tx: any) => {
      const current = await tx.inventoryAdjustment.findUniqueOrThrow({ where: { id } });
      const created = await tx.inventoryAdjustment.create({ data: { itemId: current.itemId, qty: (Number(current.qty) * -1) as never, reason: payload.reason } }) as InventoryAdjustmentDto;
      await this.auditTrailService.logTransactionalAction(
        {
          entity: "InventoryAdjustment",
          entityId: created.id,
          origin: "inventory.runAction.reverse",
          before: current,
          after: created,
        },
        tx,
      );
      return created;
    });
  }
}

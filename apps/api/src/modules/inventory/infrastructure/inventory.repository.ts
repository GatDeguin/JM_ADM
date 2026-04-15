import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import {
  ActionInventoryAdjustmentInput,
  CreateCountInput,
  CreateInternalTransferInput,
  CreateInventoryAdjustmentInput,
  CycleCountDto,
  InternalTransferDto,
  InventoryAdjustmentDto,
  MovementTraceabilityFilters,
  MovementTraceabilityRow,
  StockAvailabilityView,
  StockBalanceFilters,
  StockBalanceView,
  UpdateInventoryAdjustmentInput,
} from "../domain/inventory.types";
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
    return this.prisma.$transaction(async (tx: any) => {
      const created = await tx.inventoryAdjustment.create({ data: data as any }) as InventoryAdjustmentDto;
      const movement = await tx.stockMovement.create({
        data: {
          itemId: data.itemId,
          qty: data.qty as never,
          type: "ADJUSTMENT",
          reason: data.reason,
        },
      });
      await this.auditTrailService.logTransactionalAction(
        {
          entity: "InventoryAdjustment",
          entityId: created.id,
          origin: "inventory.create",
          after: { ...created, movementId: movement.id },
        },
        tx,
      );
      return created;
    });
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
      const movement = await tx.stockMovement.create({
        data: {
          itemId: current.itemId,
          qty: (Number(current.qty) * -1) as never,
          type: "ADJUSTMENT_REVERSE",
          reason: payload.reason,
        },
      });
      await this.auditTrailService.logTransactionalAction(
        {
          entity: "InventoryAdjustment",
          entityId: created.id,
          origin: "inventory.runAction.reverse",
          before: current,
          after: { ...created, movementId: movement.id },
        },
        tx,
      );
      return created;
    });
  }

  async getBalances(filters: StockBalanceFilters): Promise<StockBalanceView> {
    const where = {
      ...(filters.itemId ? { itemId: filters.itemId } : {}),
      ...(filters.warehouseId ? { warehouseId: filters.warehouseId } : {}),
      ...(filters.locationId ? { locationId: filters.locationId } : {}),
    };

    const rows: Array<{ itemId: string; warehouseId: string; locationId: string | null; qty: unknown; reservedQty: unknown }> = await this.prisma.stockBalance.findMany({ where });
    const lots: Array<{ lotId: string | null; itemId: string; _sum: { qty: unknown } }> = await this.prisma.stockMovement.groupBy({
      by: ["lotId", "itemId"],
      where: { ...(filters.itemId ? { itemId: filters.itemId } : {}), lotId: { not: null } },
      _sum: { qty: true },
    });
    const lotIds = lots.map((lot: { lotId: string | null }) => lot.lotId).filter((lotId: string | null): lotId is string => Boolean(lotId));
    const stockLots: Array<{ id: string; lotCode: string }> = lotIds.length > 0 ? await this.prisma.stockLot.findMany({ where: { id: { in: lotIds } } }) : [];
    const lotCodeById = new Map(stockLots.map((lot: { id: string; lotCode: string }) => [lot.id, lot.lotCode]));

    const byItemMap = new Map<string, { qty: number; reservedQty: number }>();
    for (const row of rows) {
      const current = byItemMap.get(row.itemId) ?? { qty: 0, reservedQty: 0 };
      current.qty += Number(row.qty);
      current.reservedQty += Number(row.reservedQty);
      byItemMap.set(row.itemId, current);
    }

    return {
      byItem: [...byItemMap.entries()].map(([itemId, totals]) => ({
        itemId,
        qty: totals.qty,
        reservedQty: totals.reservedQty,
        availableQty: totals.qty - totals.reservedQty,
      })),
      byLocation: rows.map((row: { itemId: string; warehouseId: string; locationId: string | null; qty: unknown; reservedQty: unknown }) => ({
        itemId: row.itemId,
        warehouseId: row.warehouseId,
        locationId: row.locationId,
        qty: Number(row.qty),
        reservedQty: Number(row.reservedQty),
        availableQty: Number(row.qty) - Number(row.reservedQty),
      })),
      byLot: lots.map((lot: { lotId: string | null; itemId: string; _sum: { qty: unknown } }) => ({
        lotId: lot.lotId as string,
        itemId: lot.itemId,
        lotCode: lotCodeById.get(lot.lotId as string) ?? "N/A",
        qty: Number(lot._sum.qty ?? 0),
      })),
    };
  }

  async getStockAvailability(itemId?: string): Promise<StockAvailabilityView[]> {
    const [balances, reservations]: [
      Array<{ itemId: string; _sum: { qty: unknown; reservedQty: unknown } }>,
      Array<{ itemId: string; _sum: { qty: unknown } }>
    ] = await Promise.all([
      this.prisma.stockBalance.groupBy({
        by: ["itemId"],
        where: itemId ? { itemId } : undefined,
        _sum: { qty: true, reservedQty: true },
      }),
      this.prisma.stockReservation.groupBy({
        by: ["itemId"],
        where: itemId ? { itemId } : undefined,
        _sum: { qty: true },
      }),
    ]);

    const reservationMap = new Map(reservations.map((r: { itemId: string; _sum: { qty: unknown } }) => [r.itemId, Number(r._sum.qty ?? 0)]));
    return balances.map((row: { itemId: string; _sum: { qty: unknown; reservedQty: unknown } }) => {
      const onHandQty = Number(row._sum.qty ?? 0);
      const reservedQty = Number(row._sum.reservedQty ?? 0);
      const reservationQty = reservationMap.get(row.itemId) ?? 0;
      return {
        itemId: row.itemId,
        onHandQty,
        reservedQty,
        reservationQty,
        availableQty: onHandQty - reservedQty,
      };
    });
  }

  createInternalTransfer(payload: CreateInternalTransferInput): Promise<InternalTransferDto> {
    return this.prisma.$transaction(async (tx: any) => {
      const source = await tx.stockBalance.findFirst({
        where: {
          itemId: payload.itemId,
          warehouseId: payload.fromWarehouseId,
          locationId: payload.fromLocationId ?? null,
        },
      });
      const sourceQty = Number(source?.qty ?? 0);
      if (sourceQty < payload.qty) throw new Error("Stock insuficiente para transferencia interna");

      await this.adjustBalance(tx, {
        itemId: payload.itemId,
        warehouseId: payload.fromWarehouseId,
        locationId: payload.fromLocationId,
        qtyDelta: payload.qty * -1,
      });
      await this.adjustBalance(tx, {
        itemId: payload.itemId,
        warehouseId: payload.toWarehouseId,
        locationId: payload.toLocationId,
        qtyDelta: payload.qty,
      });

      const [movementOut, movementIn] = await Promise.all([
        tx.stockMovement.create({
          data: {
            itemId: payload.itemId,
            lotId: payload.lotId,
            type: "TRANSFER_OUT",
            qty: (payload.qty * -1) as never,
            reason: payload.reason,
          },
        }),
        tx.stockMovement.create({
          data: {
            itemId: payload.itemId,
            lotId: payload.lotId,
            type: "TRANSFER_IN",
            qty: payload.qty as never,
            reason: payload.reason,
          },
        }),
      ]);

      const transfer: InternalTransferDto = {
        id: `transfer-${movementOut.id}`,
        itemId: payload.itemId,
        qty: payload.qty,
        reason: payload.reason,
        createdAt: movementOut.createdAt,
        fromWarehouseId: payload.fromWarehouseId,
        toWarehouseId: payload.toWarehouseId,
        fromLocationId: payload.fromLocationId ?? null,
        toLocationId: payload.toLocationId ?? null,
        lotId: payload.lotId ?? null,
        movementOutId: movementOut.id,
        movementInId: movementIn.id,
      };
      await this.auditTrailService.logTransactionalAction(
        {
          entity: "StockTransfer",
          entityId: transfer.id,
          origin: "inventory.internalTransfer",
          after: transfer,
        },
        tx,
      );
      return transfer;
    });
  }

  listCounts(type: "cycle" | "physical"): Promise<CycleCountDto[]> {
    return this.prisma.cycleCount.findMany({
      where: { status: { startsWith: `${type.toUpperCase()}_` } },
      orderBy: { date: "desc" },
    }) as Promise<CycleCountDto[]>;
  }

  async createCount(payload: CreateCountInput): Promise<CycleCountDto> {
    const created = await this.prisma.cycleCount.create({
      data: {
        warehouseId: payload.warehouseId,
        date: payload.date ?? new Date(),
        status: `${payload.type.toUpperCase()}_OPEN`,
      },
    }) as CycleCountDto;
    await this.auditTrailService.logCreate({ entity: "CycleCount", entityId: created.id, origin: "inventory.createCount", after: created });
    return created;
  }

  async getMovementTraceability(filters: MovementTraceabilityFilters): Promise<MovementTraceabilityRow[]> {
    const rows: Array<{ id: string; itemId: string; lotId: string | null; type: string; qty: unknown; reason: string | null; createdAt: Date; lot: { lotCode: string } | null }> = await this.prisma.stockMovement.findMany({
      where: {
        ...(filters.itemId ? { itemId: filters.itemId } : {}),
        ...(filters.lotId ? { lotId: filters.lotId } : {}),
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.from || filters.to ? { createdAt: { ...(filters.from ? { gte: filters.from } : {}), ...(filters.to ? { lte: filters.to } : {}) } } : {}),
      },
      include: { lot: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    const runningByItem = new Map<string, number>();
    return rows.map((row: { id: string; itemId: string; lotId: string | null; type: string; qty: unknown; reason: string | null; createdAt: Date; lot: { lotCode: string } | null }) => {
      const running = (runningByItem.get(row.itemId) ?? 0) + Number(row.qty);
      runningByItem.set(row.itemId, running);
      return {
        id: row.id,
        itemId: row.itemId,
        lotId: row.lotId,
        lotCode: row.lot?.lotCode ?? null,
        type: row.type,
        qty: Number(row.qty),
        reason: row.reason,
        createdAt: row.createdAt,
        runningQtyByItem: running,
      };
    });
  }

  private async adjustBalance(
    tx: any,
    data: { itemId: string; qtyDelta: number; warehouseId: string; locationId?: string },
  ): Promise<void> {
    const existing = await tx.stockBalance.findFirst({
      where: {
        itemId: data.itemId,
        warehouseId: data.warehouseId,
        locationId: data.locationId ?? null,
      },
    });
    if (existing) {
      await tx.stockBalance.update({
        where: { id: existing.id },
        data: { qty: (Number(existing.qty) + data.qtyDelta) as never },
      });
      return;
    }

    await tx.stockBalance.create({
      data: {
        itemId: data.itemId,
        warehouseId: data.warehouseId,
        locationId: data.locationId ?? null,
        qty: data.qtyDelta as never,
      },
    });
  }
}

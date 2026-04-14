import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";

@Injectable()
export class ProductionRepository {
  constructor(private readonly prisma: PrismaService) {}

  listOrders() {
    return this.prisma.productionOrder.findMany({ orderBy: { code: "desc" }, include: { ProductionOrderMaterialPlan: true } });
  }

  createOrder(code: string, productBaseId: string, formulaVersionId: string, plannedQty: number) {
    return this.prisma.productionOrder.create({
      data: {
        code,
        productBaseId,
        formulaVersionId,
        plannedQty,
        status: "planned",
      },
    });
  }

  findOrder(id: string) {
    return this.prisma.productionOrder.findUnique({ where: { id } });
  }

  findFormulaVersion(id: string) {
    return this.prisma.formulaVersion.findUnique({ where: { id }, select: { id: true, status: true } });
  }

  findBatch(id: string) {
    return this.prisma.batch.findUnique({ where: { id } });
  }

  findLatestQc(batchId: string) {
    return this.prisma.qCRecord.findFirst({ where: { batchId }, orderBy: { createdAt: "desc" } });
  }

  async calculateTheoreticalMaterials(orderId: string) {
    const order = await this.prisma.productionOrder.findUniqueOrThrow({
      where: { id: orderId },
      select: { formulaVersionId: true, plannedQty: true },
    });

    const components = await this.prisma.formulaComponent.findMany({ where: { formulaVersionId: order.formulaVersionId } });
    if (!components.length) {
      return;
    }

    await this.prisma.$transaction(async (tx: any) => {
      await tx.productionOrderMaterialPlan.deleteMany({ where: { productionOrderId: orderId } });
      await tx.productionOrderMaterialPlan.createMany({
        data: components.map((component: any) => ({
          productionOrderId: orderId,
          itemId: component.itemId,
          qty: Number(component.qty) * Number(order.plannedQty),
          reservedQty: 0,
        })),
      });
    });
  }

  async reserveMaterials(orderId: string) {
    const plans = await this.prisma.productionOrderMaterialPlan.findMany({ where: { productionOrderId: orderId } });

    await this.prisma.$transaction(async (tx: any) => {
      await tx.stockReservation.deleteMany({ where: { referenceType: "PRODUCTION_ORDER", referenceId: orderId } });

      for (const plan of plans) {
        await tx.stockReservation.create({
          data: {
            itemId: plan.itemId,
            referenceType: "PRODUCTION_ORDER",
            referenceId: orderId,
            qty: plan.qty,
          },
        });

        await tx.productionOrderMaterialPlan.update({
          where: { productionOrderId_itemId: { productionOrderId: orderId, itemId: plan.itemId } },
          data: { reservedQty: plan.qty },
        });

        await tx.stockMovement.create({
          data: { itemId: plan.itemId, type: "reserve", qty: plan.qty, reason: `Reserva OP ${orderId}` },
        });
      }

      await tx.productionOrder.update({ where: { id: orderId }, data: { status: "reserved" } });
    });
  }

  async startBatch(orderId: string) {
    return this.prisma.$transaction(async (tx: any) => {
      const order = await tx.productionOrder.findUniqueOrThrow({ where: { id: orderId } });
      const existing = await tx.batch.findFirst({ where: { productionOrderId: orderId }, orderBy: { code: "desc" } });
      if (existing) {
        await tx.productionOrder.update({ where: { id: orderId }, data: { status: "in_process" } });
        return existing;
      }

      const batch = await tx.batch.create({
        data: {
          code: `LOT-${order.code}-01`,
          productionOrderId: orderId,
          status: "in_process",
        },
      });
      await tx.productionOrder.update({ where: { id: orderId }, data: { status: "in_process" } });
      return batch;
    });
  }

  async recordBatchExecution(
    batchId: string,
    responsibleUserId: string,
    payload: {
      consumptions: Array<{ itemId: string; plannedQty: number; actualQty: number }>;
      wastes: Array<{ reason: string; qty: number }>;
      outputs: Array<{ itemId: string; qty: number }>;
    },
  ) {
    return this.prisma.$transaction(async (tx: any) => {
      await tx.batch.update({
        where: { id: batchId },
        data: {
          responsibleUserId,
          outputQty: payload.outputs.reduce((acc, output) => acc + output.qty, 0),
          status: "qc_pending",
        },
      });

      for (const consumption of payload.consumptions) {
        await tx.batchMaterialConsumption.upsert({
          where: { batchId_itemId: { batchId, itemId: consumption.itemId } },
          create: { batchId, itemId: consumption.itemId, plannedQty: consumption.plannedQty, actualQty: consumption.actualQty },
          update: { plannedQty: consumption.plannedQty, actualQty: consumption.actualQty },
        });

        await tx.stockMovement.create({
          data: {
            itemId: consumption.itemId,
            type: "consumption",
            qty: -Math.abs(consumption.actualQty),
            reason: `Consumo lote ${batchId}`,
          },
        });
      }

      for (const waste of payload.wastes) {
        await tx.batchWaste.create({ data: { batchId, reason: waste.reason, qty: waste.qty } });
      }

      for (const output of payload.outputs) {
        await tx.batchOutput.upsert({
          where: { batchId_itemId: { batchId, itemId: output.itemId } },
          create: { batchId, itemId: output.itemId, qty: output.qty },
          update: { qty: output.qty },
        });

        await tx.stockMovement.create({
          data: {
            itemId: output.itemId,
            type: "production_output",
            qty: output.qty,
            reason: `Output lote ${batchId}`,
          },
        });
      }
    });
  }

  async releaseBatch(batchId: string) {
    return this.prisma.batch.update({ where: { id: batchId }, data: { status: "released" } });
  }

  async createFractionation(batchId: string, skuId: string, qty: number, childLots: Array<{ lotCode: string; qty: number }>) {
    return this.prisma.$transaction(async (tx: any) => {
      const parentBatch = await tx.batch.findUniqueOrThrow({ where: { id: batchId }, select: { code: true } });
      const materials = await tx.packagingSpec.findMany({ where: { skuId } });
      if (!materials.length) {
        throw new Error("No hay especificación de packaging para el SKU seleccionado.");
      }

      for (const material of materials) {
        const required = Number(material.qty) * qty;
        const available = await tx.stockBalance.aggregate({ _sum: { qty: true }, where: { itemId: material.itemId } });
        if (Number(available._sum.qty ?? 0) < required) {
          throw new Error(`Packaging insuficiente para item ${material.itemId}`);
        }
      }

      const order = await tx.packagingOrder.create({
        data: { code: `PKG-${parentBatch.code}-${Date.now()}`, parentBatchId: batchId, skuId, qty, status: "in_process" },
      });

      for (const material of materials) {
        const required = Number(material.qty) * qty;
        await tx.packagingMaterialConsumption.create({
          data: { packagingOrderId: order.id, itemId: material.itemId, qty: required },
        });
        await tx.stockMovement.create({
          data: { itemId: material.itemId, type: "packaging_consumption", qty: -required, reason: `Fraccionamiento ${order.code}` },
        });
      }

      for (const child of childLots) {
        await tx.childBatch.create({ data: { packagingOrderId: order.id, lotCode: child.lotCode, qty: child.qty } });
      }

      await tx.packagingOrder.update({ where: { id: order.id }, data: { status: "released" } });
      return order;
    });
  }

  createFractionationOrder(batchId: string, skuId: string, qty: number) {
    return this.prisma.$transaction(async (tx: any) => {
      const parentBatch = await tx.batch.findUniqueOrThrow({ where: { id: batchId }, select: { code: true } });
      return tx.packagingOrder.create({
        data: { code: `PKG-${parentBatch.code}-${Date.now()}`, parentBatchId: batchId, skuId, qty, status: "planned" },
      });
    });
  }

  findPackagingOrder(id: string) {
    return this.prisma.packagingOrder.findUnique({ where: { id } });
  }

  async validatePackagingComponents(packagingOrderId: string) {
    const order = await this.prisma.packagingOrder.findUniqueOrThrow({ where: { id: packagingOrderId } });
    const specs = await this.prisma.packagingSpec.findMany({ where: { skuId: order.skuId } });

    const validations: Array<{ itemId: string; required: number; available: number; ok: boolean }> = [];
    for (const spec of specs) {
      const required = Number(spec.qty) * Number(order.qty);
      const balance = await this.prisma.stockBalance.aggregate({
        _sum: { qty: true, reservedQty: true },
        where: { itemId: spec.itemId },
      });
      const available = Number(balance._sum.qty ?? 0) - Number(balance._sum.reservedQty ?? 0);
      validations.push({ itemId: spec.itemId, required, available, ok: available >= required });
    }

    return { order, specs, validations };
  }

  async executeFractionation(packagingOrderId: string, childLots: Array<{ lotCode: string; qty: number }>) {
    return this.prisma.$transaction(async (tx: any) => {
      const order = await tx.packagingOrder.findUniqueOrThrow({
        where: { id: packagingOrderId },
        include: {
          parentBatch: { include: { BatchOutput: { orderBy: { id: "asc" }, take: 1, select: { itemId: true } } } },
        },
      });
      const specs = await tx.packagingSpec.findMany({ where: { skuId: order.skuId } });

      for (const spec of specs) {
        const required = Number(spec.qty) * Number(order.qty);
        await tx.packagingMaterialConsumption.upsert({
          where: { packagingOrderId_itemId: { packagingOrderId, itemId: spec.itemId } },
          create: { packagingOrderId, itemId: spec.itemId, qty: required },
          update: { qty: required },
        });
        await tx.stockMovement.create({
          data: { itemId: spec.itemId, type: "packaging_consumption", qty: -required, reason: `Fraccionamiento ${order.code}` },
        });
      }

      const finishedItemId = order.parentBatch.BatchOutput[0]?.itemId;
      if (finishedItemId) {
        const defaultWarehouse = await tx.warehouse.findFirst({ orderBy: { id: "asc" }, select: { id: true } });
        if (defaultWarehouse) {
          for (const child of childLots) {
            const lot = await tx.stockLot.upsert({
              where: { itemId_warehouseId_lotCode: { itemId: finishedItemId, warehouseId: defaultWarehouse.id, lotCode: child.lotCode } },
              create: { itemId: finishedItemId, warehouseId: defaultWarehouse.id, lotCode: child.lotCode },
              update: {},
            });
            await tx.stockMovement.create({
              data: {
                itemId: finishedItemId,
                lotId: lot.id,
                type: "finished_transfer",
                qty: child.qty,
                reason: `Ingreso terminado lote hijo ${child.lotCode} (${order.code})`,
              },
            });
          }
        }
      }

      await tx.childBatch.deleteMany({ where: { packagingOrderId } });
      await tx.childBatch.createMany({
        data: childLots.map((child) => ({ packagingOrderId, lotCode: child.lotCode, qty: child.qty })),
      });

      await tx.packagingOrder.update({ where: { id: packagingOrderId }, data: { status: "released" } });
      return order;
    });
  }

  async getBatchTimeline(batchId: string) {
    const batch = await this.prisma.batch.findUniqueOrThrow({
      where: { id: batchId },
      include: {
        productionOrder: { select: { id: true, code: true } },
        QCRecord: { orderBy: { createdAt: "asc" }, select: { id: true, decision: true, createdAt: true } },
        PackagingOrder: { include: { ChildBatch: true } },
      },
    });

    const movements = await this.prisma.stockMovement.findMany({
      where: { reason: { contains: batch.id } },
      orderBy: { createdAt: "asc" },
      select: { id: true, type: true, qty: true, reason: true, createdAt: true },
    });

    const dispatches = await this.prisma.dispatchOrder.findMany({
      where: {
        DispatchItem: {
          some: {
            skuId: { in: batch.PackagingOrder.map((pkg: any) => pkg.skuId) },
          },
        },
      },
      select: { id: true, code: true, status: true },
    });

    const timeline = [
      { type: "origin", date: null, detail: `OP ${batch.productionOrder?.code ?? "N/A"} → lote ${batch.code}` },
      ...movements.map((movement: any) => ({ type: "stock", date: movement.createdAt, detail: `${movement.type} ${movement.qty}` })),
      ...batch.QCRecord.map((qc: any) => ({ type: "qc", date: qc.createdAt, detail: `${qc.id} (${qc.decision})` })),
      ...batch.PackagingOrder.flatMap((pkg: any) => [
        { type: "transformation", date: null, detail: `Fraccionamiento ${pkg.code}` },
        ...pkg.ChildBatch.map((child: any) => ({ type: "transformation", date: null, detail: `Lote hijo ${child.lotCode} (${child.qty})` })),
      ]),
      ...dispatches.map((dispatch: any) => ({ type: "dispatch", date: null, detail: `Despacho ${dispatch.code} (${dispatch.status})` })),
    ];

    return { batchId: batch.id, timeline };
  }
}

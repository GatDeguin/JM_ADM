import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import {
  assertBatchCanBeFractionated,
  assertPositiveNumber,
  assertRequiredText,
} from "../../../common/domain-rules/shared-domain-rules";
import { DomainEventsService } from "../../../common/events/domain-events.service";
import { AuditTrailService } from "../../audit/application/audit-trail.service";
import { ProductionRepository } from "../infrastructure/production.repository";

type BatchExecutionInput = {
  responsible: string;
  consumptions: Array<{ itemId: string; plannedQty: number; actualQty: number }>;
  wastes: Array<{ reason: string; qty: number }>;
  outputs: Array<{ itemId: string; qty: number }>;
};

@Injectable()
export class ProductionService {
  constructor(
    private readonly productionRepository: ProductionRepository,
    private readonly auditTrail: Pick<AuditTrailService, "logTransactionalAction"> = { logTransactionalAction: async () => undefined },
    private readonly domainEvents: Pick<DomainEventsService, "emit"> = { emit: () => undefined },
  ) {}

  list() {
    return this.productionRepository.listOrders();
  }

  async create(code: string, productBaseId: string, formulaVersionId: string, plannedQty: number) {
    assertPositiveNumber(plannedQty, "La cantidad planificada");
    const formulaVersion = await this.productionRepository.findFormulaVersion(formulaVersionId);
    if (!formulaVersion || formulaVersion.status !== "approved") {
      throw new ConflictException("La OP sólo puede crearse con una fórmula vigente y aprobada.");
    }

    try {
      const order = await this.productionRepository.createOrder(code, productBaseId, formulaVersionId, plannedQty);
      await this.productionRepository.calculateTheoreticalMaterials(order.id);

      await this.auditTrail.logTransactionalAction({
        entity: "production_order",
        entityId: order.id,
        origin: "production.create",
        after: { code: order.code, status: order.status, formulaVersionId, plannedQty },
      });
      this.domainEvents.emit({
        name: "production.order.created",
        entity: "production_order",
        entityId: order.id,
        occurredAt: new Date().toISOString(),
        metadata: { code: order.code, plannedQty },
      });
      this.domainEvents.emit({
        name: "production.materials.theoretical_calculated",
        entity: "production_order",
        entityId: order.id,
        occurredAt: new Date().toISOString(),
      });

      return { ...order, event: "production.order.created" };
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
        throw new ConflictException("El código de orden de producción ya existe");
      }
      throw error;
    }
  }

  async reserveMaterials(id: string) {
    const order = await this.productionRepository.findOrder(id);
    if (!order) {
      throw new NotFoundException("Orden de producción no encontrada");
    }
    await this.productionRepository.reserveMaterials(id);

    await this.auditTrail.logTransactionalAction({
      entity: "production_order",
      entityId: id,
      origin: "production.reserveMaterials",
      before: { status: order.status },
      after: { status: "reserved" },
    });
    this.domainEvents.emit({
      name: "production.materials.reserved",
      entity: "production_order",
      entityId: id,
      occurredAt: new Date().toISOString(),
    });

    return { event: "production.materials.reserved", id };
  }

  async start(id: string) {
    const order = await this.productionRepository.findOrder(id);
    if (!order) {
      throw new NotFoundException("Orden de producción no encontrada");
    }
    const batch = await this.productionRepository.startBatch(id);

    await this.auditTrail.logTransactionalAction({
      entity: "batch",
      entityId: batch.id,
      origin: "production.startBatch",
      after: { code: batch.code, status: "in_process", productionOrderId: id },
    });
    this.domainEvents.emit({
      name: "production.batch.started",
      entity: "batch",
      entityId: batch.id,
      occurredAt: new Date().toISOString(),
      metadata: { productionOrderId: id },
    });

    return { event: "production.order.started", id, batchId: batch.id, batchCode: batch.code };
  }

  async close(id: string, payload: BatchExecutionInput) {
    const responsible = assertRequiredText(payload.responsible, "el responsable");
    if (!payload.outputs.length) {
      throw new ConflictException("Debes informar al menos un output real para cerrar el lote.");
    }

    for (const consumption of payload.consumptions) {
      assertPositiveNumber(consumption.actualQty, "El consumo real");
      assertPositiveNumber(consumption.plannedQty, "El consumo teórico");
    }
    for (const waste of payload.wastes) {
      assertPositiveNumber(waste.qty, "La merma");
      assertRequiredText(waste.reason, "el motivo de merma");
    }
    for (const output of payload.outputs) {
      assertPositiveNumber(output.qty, "La cantidad de salida");
    }

    const before = await this.productionRepository.findBatch(id);
    if (!before) {
      throw new NotFoundException("Batch no encontrado");
    }

    const outputQty = payload.outputs.reduce((acc, output) => acc + output.qty, 0);
    await this.productionRepository.recordBatchExecution(id, responsible, payload);

    await this.auditTrail.logTransactionalAction({
      entity: "batch",
      entityId: id,
      origin: "production.closeBatch",
      before: { status: before.status, responsibleUserId: before.responsibleUserId, outputQty: before.outputQty },
      after: { status: "qc_pending", responsibleUserId: responsible, outputQty },
    });
    this.domainEvents.emit({
      name: "production.batch.closed",
      entity: "batch",
      entityId: id,
      occurredAt: new Date().toISOString(),
      metadata: { status: "qc_pending", outputQty, consumptions: payload.consumptions.length, wastes: payload.wastes.length },
    });

    return { event: "production.batch.closed", id, status: "qc_pending" };
  }

  async releaseBatch(id: string) {
    const batch = await this.productionRepository.findBatch(id);
    if (!batch) {
      throw new NotFoundException("Batch no encontrado");
    }

    const requiresQc = this.productionRepository.batchRequiresQc ? await this.productionRepository.batchRequiresQc(batch.id) : true;
    if (requiresQc) {
      const latestQc = await this.productionRepository.findLatestQc(batch.id);
      if (!latestQc || latestQc.decision !== "approved") {
        throw new ConflictException("No se puede liberar el lote sin QC aprobado.");
      }
    }

    await this.productionRepository.releaseBatch(id);
    return { event: "quality.batch.released", id, qcRequired: requiresQc };
  }

  async fractionate(batchId: string, qty: number, skuId: string, childLots: Array<{ lotCode: string; qty: number }>) {
    assertPositiveNumber(qty, "La cantidad a fraccionar");
    const batch = await this.productionRepository.findBatch(batchId);
    if (!batch) {
      throw new NotFoundException("Batch no encontrado");
    }
    assertBatchCanBeFractionated(batch.status);
    if (batch.status !== "released") {
      throw new ConflictException("Sólo se puede fraccionar un lote madre en estado released.");
    }
    if (!childLots.length) {
      throw new ConflictException("Debes informar al menos un lote hijo para fraccionar.");
    }

    const childTotal = childLots.reduce((acc, lot) => acc + lot.qty, 0);
    if (Math.abs(childTotal - qty) > 0.0001) {
      throw new ConflictException("La suma de los lotes hijo debe coincidir con la cantidad a fraccionar.");
    }

    const order = await this.productionRepository.createFractionation(batchId, skuId, qty, childLots);
    return { event: "production.batch.fractionated", batchId, packagingOrderId: order.id, qty };
  }

  async generateFractionationOrder(batchId: string, skuId: string, qty: number) {
    assertPositiveNumber(qty, "La cantidad a fraccionar");
    const batch = await this.productionRepository.findBatch(batchId);
    if (!batch) {
      throw new NotFoundException("Batch no encontrado");
    }
    if (batch.status === "retained") {
      throw new ConflictException("No se puede generar orden de fraccionamiento con lote madre retenido.");
    }

    const order = await this.productionRepository.createFractionationOrder(batchId, skuId, qty);
    return { event: "production.fractionation.order.created", batchId, packagingOrderId: order.id, status: order.status };
  }

  async validateParentBatch(batchId: string) {
    const batch = await this.productionRepository.findBatch(batchId);
    if (!batch) {
      throw new NotFoundException("Batch no encontrado");
    }
    return {
      batchId,
      status: batch.status,
      canFractionate: batch.status !== "retained",
      message: batch.status === "retained" ? "Lote madre retenido: no se puede fraccionar." : "Lote madre válido para fraccionamiento.",
    };
  }

  async validatePackagingComponents(packagingOrderId: string) {
    const order = await this.productionRepository.findPackagingOrder(packagingOrderId);
    if (!order) {
      throw new NotFoundException("Orden de packaging no encontrada");
    }
    const validation = await this.productionRepository.validatePackagingComponents(packagingOrderId);
    if (!validation.specs.length) {
      throw new ConflictException("No hay especificación de packaging para el SKU de la orden.");
    }

    const missing = validation.validations.filter((line) => !line.ok);
    return {
      packagingOrderId,
      valid: missing.length === 0,
      missing,
      details: validation.validations,
    };
  }

  async executeFractionation(packagingOrderId: string, childLots: Array<{ lotCode: string; qty: number }>) {
    const order = await this.productionRepository.findPackagingOrder(packagingOrderId);
    if (!order) {
      throw new NotFoundException("Orden de packaging no encontrada");
    }
    if (!childLots.length) {
      throw new ConflictException("Debes informar al menos un lote hijo para ejecutar el fraccionamiento.");
    }
    const childTotal = childLots.reduce((acc, child) => acc + child.qty, 0);
    if (Math.abs(childTotal - Number(order.qty)) > 0.0001) {
      throw new ConflictException("La suma de lotes hijo debe coincidir con la cantidad de la orden de packaging.");
    }

    const validation = await this.validatePackagingComponents(packagingOrderId);
    if (!validation.valid) {
      throw new ConflictException("No hay disponibilidad suficiente de componentes de packaging.");
    }

    await this.productionRepository.executeFractionation(packagingOrderId, childLots);
    return {
      event: "production.fractionation.executed",
      packagingOrderId,
      childBatches: childLots.length,
      movedToFinishedStock: true,
    };
  }

  async traceTimeline(batchId: string) {
    return this.productionRepository.getBatchTimeline(batchId);
  }
}

import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { DomainEventsService } from "../../../common/events/domain-events.service";
import { AuditTrailService } from "../../audit/application/audit-trail.service";
import { ActionQCRecordInput, CreateQCRecordInput, QCProcess, QCRecordDto, UpdateQCRecordInput } from "../domain/quality.types";
import { QualityRepository } from "../infrastructure/quality.repository";

@Injectable()
export class QualityService {
  constructor(
    private readonly repository: QualityRepository,
    private readonly auditTrail: Pick<AuditTrailService, "logTransactionalAction"> = { logTransactionalAction: async () => undefined },
    private readonly domainEvents: Pick<DomainEventsService, "emit"> = { emit: () => undefined },
  ) {}

  list(): Promise<QCRecordDto[]> {
    return this.repository.list();
  }

  get(id: string): Promise<QCRecordDto> {
    return this.repository.get(id);
  }

  async getChecklistForBatch(batchId: string, process: QCProcess = "production", skuId?: string) {
    const context = await this.repository.findBatchQualityContext(batchId);
    if (!context) {
      throw new NotFoundException("No se pudo identificar la familia del lote.");
    }
    return this.repository.listChecklistByContext({ ...context, skuId: skuId ?? null, process });
  }

  async create(data: CreateQCRecordInput): Promise<QCRecordDto & { summary: { approvedItems: number; rejectedItems: number } }> {
    if (!data.checklistItems.length) {
      throw new ConflictException("Debes completar checklist de QC.");
    }

    const batch = await this.repository.findBatch(data.batchId);
    if (!batch) {
      throw new NotFoundException("Batch no encontrado para control de calidad.");
    }
    if (batch.status !== "qc_pending") {
      throw new ConflictException("El lote debe estar en qc_pending para registrar una decisión de calidad.");
    }

    const rejectedItems = data.checklistItems.filter((item) => !item.passed).length;
    if (data.decision === "approved" && rejectedItems > 0) {
      throw new ConflictException("No se puede aprobar QC con ítems rechazados.");
    }

    const qc = await this.repository.createWithChecklist(data);
    const approvedItems = data.checklistItems.length - rejectedItems;

    await this.auditTrail.logTransactionalAction({
      entity: "qc_record",
      entityId: qc.id,
      origin: "quality.createQCRecord",
      after: { batchId: data.batchId, decision: data.decision, approvedItems, rejectedItems },
    });
    this.domainEvents.emit({
      name: "quality.qc.decision_recorded",
      entity: "batch",
      entityId: data.batchId,
      occurredAt: new Date().toISOString(),
      metadata: { qcRecordId: qc.id, decision: data.decision, approvedItems, rejectedItems },
    });

    return { ...qc, summary: { approvedItems, rejectedItems } };
  }

  update(id: string, data: UpdateQCRecordInput): Promise<QCRecordDto> {
    return this.repository.update(id, data);
  }

  remove(id: string) {
    return this.repository.remove(id);
  }

  runAction(id: string, payload: ActionQCRecordInput): Promise<unknown> {
    return this.repository.runAction(id, payload);
  }
}

import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { DomainEventsService } from "../../../common/events/domain-events.service";
import { AuditTrailService } from "../../audit/application/audit-trail.service";
import { ActionQCRecordInput, CreateQCRecordInput, QCRecordDto, UpdateQCRecordInput } from "../domain/quality.types";
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

  async getChecklistForBatch(batchId: string) {
    const family = await this.repository.findBatchFamily(batchId);
    if (!family) {
      throw new NotFoundException("No se pudo identificar la familia del lote.");
    }
    return this.repository.listChecklistByFamily(family.id, family.name);
  }

  async create(data: CreateQCRecordInput): Promise<QCRecordDto> {
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

    const qc = await this.repository.createWithChecklist(data);

    await this.auditTrail.logTransactionalAction({
      entity: "qc_record",
      entityId: qc.id,
      origin: "quality.createQCRecord",
      after: { batchId: data.batchId, decision: data.decision },
    });
    this.domainEvents.emit({
      name: "quality.qc.decision_recorded",
      entity: "batch",
      entityId: data.batchId,
      occurredAt: new Date().toISOString(),
      metadata: { qcRecordId: qc.id, decision: data.decision },
    });

    return qc;
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

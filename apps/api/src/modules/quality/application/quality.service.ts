import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { QualityRepository } from "../infrastructure/quality.repository";
import { ActionQCRecordInput, CreateQCRecordInput, QCRecordDto, UpdateQCRecordInput } from "../domain/quality.types";

@Injectable()
export class QualityService {
  constructor(private readonly repository: QualityRepository) {}

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
    return this.repository.createWithChecklist(data);
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

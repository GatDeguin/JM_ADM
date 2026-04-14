import { Injectable } from "@nestjs/common";
import { QualityRepository } from "../infrastructure/quality.repository";
import { ActionQCRecordInput, CreateQCRecordInput, QCRecordDto, UpdateQCRecordInput } from "../domain/quality.types";

@Injectable()
export class QualityService {
  constructor(private readonly repository: QualityRepository) {}

  list(): Promise<QCRecordDto[]> { return this.repository.list(); }
  get(id: string): Promise<QCRecordDto> { return this.repository.get(id); }
  create(data: CreateQCRecordInput): Promise<QCRecordDto> { return this.repository.create(data); }
  update(id: string, data: UpdateQCRecordInput): Promise<QCRecordDto> { return this.repository.update(id, data); }
  remove(id: string) { return this.repository.remove(id); }
  runAction(id: string, payload: ActionQCRecordInput): Promise<unknown> { return this.repository.runAction(id, payload); }
}

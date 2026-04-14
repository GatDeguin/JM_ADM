import { Injectable } from "@nestjs/common";
import { AuditRepository } from "../infrastructure/audit.repository";
import { ActionAuditLogInput, CreateAuditLogInput, AuditLogDto, UpdateAuditLogInput } from "../domain/audit.types";

@Injectable()
export class AuditService {
  constructor(private readonly repository: AuditRepository) {}

  list(limit?: number): Promise<AuditLogDto[]> { return this.repository.list(limit); }
  timeline(entity: string, entityId: string, limit?: number): Promise<AuditLogDto[]> { return this.repository.listByEntity(entity, entityId, limit); }
  get(id: string): Promise<AuditLogDto> { return this.repository.get(id); }
  create(data: CreateAuditLogInput): Promise<AuditLogDto> { return this.repository.create(data); }
  update(id: string, data: UpdateAuditLogInput): Promise<AuditLogDto> { return this.repository.update(id, data); }
  remove() { return this.repository.remove(); }
  runAction(id: string, payload: ActionAuditLogInput): Promise<AuditLogDto> { return this.repository.runAction(id, payload); }
}

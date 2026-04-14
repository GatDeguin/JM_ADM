import { Injectable } from "@nestjs/common";
import { AuditRepository } from "../infrastructure/audit.repository";
import { ActionAuditLogInput, CreateAuditLogInput, AuditLogDto, UpdateAuditLogInput } from "../domain/audit.types";

@Injectable()
export class AuditService {
  constructor(private readonly repository: AuditRepository) {}

  list(): Promise<AuditLogDto[]> { return this.repository.list(); }
  get(id: string): Promise<AuditLogDto> { return this.repository.get(id); }
  create(data: CreateAuditLogInput): Promise<AuditLogDto> { return this.repository.create(data); }
  update(id: string, data: UpdateAuditLogInput): Promise<AuditLogDto> { return this.repository.update(id, data); }
  remove(id: string) { return this.repository.remove(id); }
  runAction(id: string, payload: ActionAuditLogInput): Promise<AuditLogDto> { return this.repository.runAction(id, payload); }
}

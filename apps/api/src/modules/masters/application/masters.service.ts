import { Injectable } from "@nestjs/common";
import { MastersRepository } from "../infrastructure/masters.repository";
import { ActionUnitInput, ContextualEntityType, ContextualOptionDto, CreateContextualEntityInput, CreateUnitInput, UnitDto, UpdateUnitInput } from "../domain/masters.types";

@Injectable()
export class MastersService {
  constructor(private readonly repository: MastersRepository) {}

  list(): Promise<UnitDto[]> { return this.repository.list(); }
  get(id: string): Promise<UnitDto> { return this.repository.get(id); }
  create(data: CreateUnitInput): Promise<UnitDto> { return this.repository.create(data); }
  update(id: string, data: UpdateUnitInput): Promise<UnitDto> { return this.repository.update(id, data); }
  remove(id: string) { return this.repository.remove(id); }
  runAction(id: string, payload: ActionUnitInput): Promise<UnitDto> { return this.repository.runAction(id, payload); }

  listContextualOptions(entityType: ContextualEntityType): Promise<ContextualOptionDto[]> {
    return this.repository.listContextualOptions(entityType);
  }

  async createContextualEntity(entityType: ContextualEntityType, data: CreateContextualEntityInput): Promise<ContextualOptionDto> {
    const created = await this.repository.createContextualEntity(entityType, data);
    await this.repository.createContextualAudit({
      entityType,
      entityId: created.id,
      originFlow: data.originFlow,
      payload: data
    });
    return created;
  }
}

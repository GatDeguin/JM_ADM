import { Injectable } from "@nestjs/common";
import { MastersRepository } from "../infrastructure/masters.repository";
import { ActionUnitInput, CreateUnitInput, UnitDto, UpdateUnitInput } from "../domain/masters.types";

@Injectable()
export class MastersService {
  constructor(private readonly repository: MastersRepository) {}

  list(): Promise<UnitDto[]> { return this.repository.list(); }
  get(id: string): Promise<UnitDto> { return this.repository.get(id); }
  create(data: CreateUnitInput): Promise<UnitDto> { return this.repository.create(data); }
  update(id: string, data: UpdateUnitInput): Promise<UnitDto> { return this.repository.update(id, data); }
  remove(id: string) { return this.repository.remove(id); }
  runAction(id: string, payload: ActionUnitInput): Promise<UnitDto> { return this.repository.runAction(id, payload); }
}

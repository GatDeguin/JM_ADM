import { Injectable } from "@nestjs/common";
import { CostingRepository } from "../infrastructure/costing.repository";
import { ActionMonthlyCloseInput, CreateMonthlyCloseInput, MonthlyCloseDto, UpdateMonthlyCloseInput } from "../domain/costing.types";

@Injectable()
export class CostingService {
  constructor(private readonly repository: CostingRepository) {}

  list(): Promise<MonthlyCloseDto[]> { return this.repository.list(); }
  get(id: string): Promise<MonthlyCloseDto> { return this.repository.get(id); }
  create(data: CreateMonthlyCloseInput): Promise<MonthlyCloseDto> { return this.repository.create(data); }
  update(id: string, data: UpdateMonthlyCloseInput): Promise<MonthlyCloseDto> { return this.repository.update(id, data); }
  remove(id: string) { return this.repository.remove(id); }
  runAction(id: string, payload: ActionMonthlyCloseInput): Promise<MonthlyCloseDto> { return this.repository.runAction(id, payload); }
}

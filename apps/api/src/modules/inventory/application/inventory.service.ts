import { Injectable } from "@nestjs/common";
import { InventoryRepository } from "../infrastructure/inventory.repository";
import { ActionInventoryAdjustmentInput, CreateInventoryAdjustmentInput, InventoryAdjustmentDto, UpdateInventoryAdjustmentInput } from "../domain/inventory.types";

@Injectable()
export class InventoryService {
  constructor(private readonly repository: InventoryRepository) {}

  list(): Promise<InventoryAdjustmentDto[]> { return this.repository.list(); }
  get(id: string): Promise<InventoryAdjustmentDto> { return this.repository.get(id); }
  create(data: CreateInventoryAdjustmentInput): Promise<InventoryAdjustmentDto> { return this.repository.create(data); }
  update(id: string, data: UpdateInventoryAdjustmentInput): Promise<InventoryAdjustmentDto> { return this.repository.update(id, data); }
  remove(id: string) { return this.repository.remove(id); }
  runAction(id: string, payload: ActionInventoryAdjustmentInput): Promise<InventoryAdjustmentDto> { return this.repository.runAction(id, payload); }
}

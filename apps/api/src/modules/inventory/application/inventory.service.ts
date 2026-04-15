import { Injectable } from "@nestjs/common";
import { InventoryRepository } from "../infrastructure/inventory.repository";
import {
  ActionInventoryAdjustmentInput,
  CreateCountInput,
  CreateInternalTransferInput,
  CreateInventoryAdjustmentInput,
  CycleCountDto,
  InternalTransferDto,
  InventoryAdjustmentDto,
  MovementTraceabilityFilters,
  MovementTraceabilityRow,
  StockAvailabilityView,
  StockBalanceFilters,
  StockBalanceView,
  UpdateInventoryAdjustmentInput,
} from "../domain/inventory.types";

@Injectable()
export class InventoryService {
  constructor(private readonly repository: InventoryRepository) {}

  list(): Promise<InventoryAdjustmentDto[]> { return this.repository.list(); }
  get(id: string): Promise<InventoryAdjustmentDto> { return this.repository.get(id); }
  create(data: CreateInventoryAdjustmentInput): Promise<InventoryAdjustmentDto> { return this.repository.create(data); }
  update(id: string, data: UpdateInventoryAdjustmentInput): Promise<InventoryAdjustmentDto> { return this.repository.update(id, data); }
  remove(id: string) { return this.repository.remove(id); }
  runAction(id: string, payload: ActionInventoryAdjustmentInput): Promise<InventoryAdjustmentDto> { return this.repository.runAction(id, payload); }
  getBalances(filters: StockBalanceFilters): Promise<StockBalanceView> { return this.repository.getBalances(filters); }
  getStockAvailability(itemId?: string): Promise<StockAvailabilityView[]> { return this.repository.getStockAvailability(itemId); }
  createInternalTransfer(payload: CreateInternalTransferInput): Promise<InternalTransferDto> { return this.repository.createInternalTransfer(payload); }
  listCounts(type: "cycle" | "physical"): Promise<CycleCountDto[]> { return this.repository.listCounts(type); }
  createCount(payload: CreateCountInput): Promise<CycleCountDto> { return this.repository.createCount(payload); }
  getMovementTraceability(filters: MovementTraceabilityFilters): Promise<MovementTraceabilityRow[]> { return this.repository.getMovementTraceability(filters); }
}

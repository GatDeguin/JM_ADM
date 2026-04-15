import { HttpStatus, Injectable } from "@nestjs/common";
import { throwDomainError } from "../../../common/domain-rules/domain-errors";
import { assertNonZeroNumber, assertRequiredText } from "../../../common/domain-rules/shared-domain-rules";
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

  create(data: CreateInventoryAdjustmentInput): Promise<InventoryAdjustmentDto> {
    assertRequiredText(data.itemId, "el ítem");
    assertNonZeroNumber(data.qty, "La cantidad de ajuste");
    assertRequiredText(data.reason, "el motivo de ajuste");
    return this.repository.create(data);
  }

  update(id: string, data: UpdateInventoryAdjustmentInput): Promise<InventoryAdjustmentDto> {
    assertRequiredText(data.reason, "el motivo de ajuste");
    return this.repository.update(id, data);
  }

  remove(id: string) { return this.repository.remove(id); }

  runAction(id: string, payload: ActionInventoryAdjustmentInput): Promise<InventoryAdjustmentDto> {
    assertRequiredText(payload.reason, "el motivo de reversa");
    return this.repository.runAction(id, payload);
  }

  getBalances(filters: StockBalanceFilters): Promise<StockBalanceView> { return this.repository.getBalances(filters); }
  getStockAvailability(itemId?: string): Promise<StockAvailabilityView[]> { return this.repository.getStockAvailability(itemId); }

  async createInternalTransfer(payload: CreateInternalTransferInput): Promise<InternalTransferDto> {
    if (payload.fromWarehouseId === payload.toWarehouseId && (payload.fromLocationId ?? null) === (payload.toLocationId ?? null)) {
      throwDomainError(
        "RULE_INVENTORY_TRANSFER_DIFFERENT_LOCATION",
        "La transferencia interna requiere origen y destino diferentes.",
        HttpStatus.BAD_REQUEST,
        "R-IV-003",
      );
    }
    return this.repository.createInternalTransfer(payload);
  }

  listCounts(type: "cycle" | "physical"): Promise<CycleCountDto[]> { return this.repository.listCounts(type); }
  createCount(payload: CreateCountInput): Promise<CycleCountDto> { return this.repository.createCount(payload); }
  getMovementTraceability(filters: MovementTraceabilityFilters): Promise<MovementTraceabilityRow[]> { return this.repository.getMovementTraceability(filters); }
}

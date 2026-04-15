export type InventoryAdjustmentDto = { id: string; itemId: string; qty: unknown; reason: string; createdAt: Date };
export type CreateInventoryAdjustmentInput = { itemId: string; qty: number; reason: string };
export type UpdateInventoryAdjustmentInput = { reason: string };
export type ActionInventoryAdjustmentInput = { reason: string };

export type StockBalanceFilters = { itemId?: string; locationId?: string; warehouseId?: string };
export type StockBalanceView = {
  byItem: Array<{ itemId: string; qty: number; reservedQty: number; availableQty: number }>;
  byLocation: Array<{ itemId: string; warehouseId: string; locationId: string | null; qty: number; reservedQty: number; availableQty: number }>;
  byLot: Array<{ lotId: string; itemId: string; lotCode: string; qty: number }>;
};

export type StockAvailabilityView = {
  itemId: string;
  onHandQty: number;
  reservedQty: number;
  reservationQty: number;
  availableQty: number;
};

export type CreateInternalTransferInput = {
  itemId: string;
  qty: number;
  fromWarehouseId: string;
  toWarehouseId: string;
  fromLocationId?: string;
  toLocationId?: string;
  lotId?: string;
  reason: string;
};

export type InternalTransferDto = {
  id: string;
  itemId: string;
  qty: number;
  reason: string;
  createdAt: Date;
  fromWarehouseId: string;
  toWarehouseId: string;
  fromLocationId: string | null;
  toLocationId: string | null;
  lotId: string | null;
  movementOutId: string;
  movementInId: string;
};

export type CreateCountInput = { warehouseId: string; type: "cycle" | "physical"; date?: Date };
export type CycleCountDto = { id: string; warehouseId: string; date: Date; status: string };

export type MovementTraceabilityFilters = {
  itemId?: string;
  lotId?: string;
  type?: string;
  from?: Date;
  to?: Date;
};
export type MovementTraceabilityRow = {
  id: string;
  itemId: string;
  lotId: string | null;
  lotCode: string | null;
  type: string;
  qty: number;
  reason: string | null;
  createdAt: Date;
  runningQtyByItem: number;
};

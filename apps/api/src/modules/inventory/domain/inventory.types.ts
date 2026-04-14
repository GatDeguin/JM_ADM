export type InventoryAdjustmentDto = { id: string; itemId: string; qty: unknown; reason: string; createdAt: Date };
export type CreateInventoryAdjustmentInput = { itemId: string; qty: number; reason: string };
export type UpdateInventoryAdjustmentInput = { reason?: string };
export type ActionInventoryAdjustmentInput = { reason: string };

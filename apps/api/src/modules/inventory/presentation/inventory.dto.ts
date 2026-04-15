import { z } from "zod";

export const createInventoryAdjustmentSchema = z.object({
  itemId: z.string().min(1),
  qty: z.number().refine((v) => v !== 0),
  reason: z.string().min(3),
});
export const updateInventoryAdjustmentSchema = z.object({ reason: z.string().min(3) });
export const inventoryAdjustmentActionSchema = z.object({ reason: z.string().min(3) });
export const createInternalTransferSchema = z.object({
  itemId: z.string().min(1),
  qty: z.number().positive(),
  fromWarehouseId: z.string().min(1),
  toWarehouseId: z.string().min(1),
  fromLocationId: z.string().min(1).optional(),
  toLocationId: z.string().min(1).optional(),
  lotId: z.string().min(1).optional(),
  reason: z.string().min(3),
}).refine((data) => data.fromWarehouseId !== data.toWarehouseId || data.fromLocationId !== data.toLocationId, {
  message: "Origen y destino no pueden ser iguales",
});
export const createCountSchema = z.object({
  warehouseId: z.string().min(1),
  type: z.enum(["cycle", "physical"]),
  date: z.coerce.date().optional(),
});
export const movementTraceabilityQuerySchema = z.object({
  itemId: z.string().min(1).optional(),
  lotId: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type CreateInventoryAdjustmentDto = z.infer<typeof createInventoryAdjustmentSchema>;
export type UpdateInventoryAdjustmentDto = z.infer<typeof updateInventoryAdjustmentSchema>;
export type InventoryAdjustmentActionDto = z.infer<typeof inventoryAdjustmentActionSchema>;
export type CreateInternalTransferDto = z.infer<typeof createInternalTransferSchema>;
export type CreateCountDto = z.infer<typeof createCountSchema>;
export type MovementTraceabilityQueryDto = z.infer<typeof movementTraceabilityQuerySchema>;

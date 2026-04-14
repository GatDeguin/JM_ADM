import { z } from "zod";

export const createInventoryAdjustmentSchema = z.object({
  itemId: z.string().min(1),
  qty: z.number().refine((v) => v !== 0),
  reason: z.string().min(3),
});
export const updateInventoryAdjustmentSchema = z.object({ reason: z.string().min(3).optional() });
export const inventoryAdjustmentActionSchema = z.object({ reason: z.string().min(3) });

export type CreateInventoryAdjustmentDto = z.infer<typeof createInventoryAdjustmentSchema>;
export type UpdateInventoryAdjustmentDto = z.infer<typeof updateInventoryAdjustmentSchema>;
export type InventoryAdjustmentActionDto = z.infer<typeof inventoryAdjustmentActionSchema>;

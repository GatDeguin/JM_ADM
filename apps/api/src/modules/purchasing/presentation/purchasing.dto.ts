import { z } from "zod";

export const createPurchaseOrderSchema = z.object({
  code: z.string().min(2),
  supplierId: z.string().min(1),
  status: z.string().default("draft"),
});
export const updatePurchaseOrderSchema = z.object({ status: z.string().optional() });
export const purchaseOrderActionSchema = z.object({});

export type CreatePurchaseOrderDto = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderDto = z.infer<typeof updatePurchaseOrderSchema>;
export type PurchaseOrderActionDto = z.infer<typeof purchaseOrderActionSchema>;

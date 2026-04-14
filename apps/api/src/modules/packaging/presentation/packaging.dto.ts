import { z } from "zod";

export const createPackagingOrderSchema = z.object({
  code: z.string().min(2),
  parentBatchId: z.string().min(1),
  skuId: z.string().min(1),
  qty: z.number().positive(),
});
export const updatePackagingOrderSchema = z.object({ qty: z.number().positive().optional(), status: z.string().optional() });
export const packagingOrderActionSchema = z.object({});

export type CreatePackagingOrderDto = z.infer<typeof createPackagingOrderSchema>;
export type UpdatePackagingOrderDto = z.infer<typeof updatePackagingOrderSchema>;
export type PackagingOrderActionDto = z.infer<typeof packagingOrderActionSchema>;

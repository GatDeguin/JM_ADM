import { z } from "zod";

const lineItemSchema = z.object({
  itemId: z.string().min(1),
  qty: z.coerce.number().positive(),
});

const purchaseOrderItemSchema = lineItemSchema.extend({
  unitCost: z.coerce.number().positive(),
});

export const createPurchaseRequestSchema = z.object({
  code: z.string().min(2),
  status: z.string().default("draft").optional(),
  items: z.array(lineItemSchema).min(1),
});

export const updatePurchaseRequestSchema = z.object({ status: z.string().optional() });

export const createPurchaseOrderSchema = z.object({
  code: z.string().min(2),
  supplierId: z.string().min(1),
  status: z.string().default("draft").optional(),
  requestId: z.string().optional(),
  items: z.array(purchaseOrderItemSchema).min(1),
});

export const updatePurchaseOrderSchema = z.object({ status: z.string().optional() });

export const purchaseOrderActionSchema = z.object({
  action: z.enum(["approve", "confirm"]).default("approve"),
});

export const createGoodsReceiptSchema = z.object({
  code: z.string().min(2),
  purchaseOrderId: z.string().min(1),
  status: z.string().default("received_partial").optional(),
  items: z.array(lineItemSchema.extend({ acceptedQty: z.coerce.number().min(0) })).min(1),
});

export type CreatePurchaseRequestDto = z.infer<typeof createPurchaseRequestSchema>;
export type UpdatePurchaseRequestDto = z.infer<typeof updatePurchaseRequestSchema>;
export type CreatePurchaseOrderDto = z.infer<typeof createPurchaseOrderSchema>;
export type UpdatePurchaseOrderDto = z.infer<typeof updatePurchaseOrderSchema>;
export type PurchaseOrderActionDto = z.infer<typeof purchaseOrderActionSchema>;
export type CreateGoodsReceiptDto = z.infer<typeof createGoodsReceiptSchema>;

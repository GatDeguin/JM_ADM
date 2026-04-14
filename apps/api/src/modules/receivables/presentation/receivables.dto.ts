import { z } from "zod";

export const createReceivableSchema = z.object({
  customerId: z.string().min(1),
  salesOrderId: z.string().min(1),
  dueDate: z.string().datetime(),
  amount: z.number().positive(),
});
export const updateReceivableSchema = z.object({
  status: z.enum(["open", "partial", "paid", "overdue", "cancelled"]).optional(),
});
export const applyReceiptSchema = z.object({
  code: z.string().min(2),
  cashAccountId: z.string().min(1),
  amount: z.number().positive(),
  allocations: z.array(z.object({ receivableId: z.string().min(1), amount: z.number().positive() })).min(1),
});

export type CreateReceivableDto = z.infer<typeof createReceivableSchema>;
export type UpdateReceivableDto = z.infer<typeof updateReceivableSchema>;
export type ApplyReceiptDto = z.infer<typeof applyReceiptSchema>;

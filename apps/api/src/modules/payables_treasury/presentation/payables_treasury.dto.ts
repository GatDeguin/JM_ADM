import { z } from "zod";

export const createPayableSchema = z.object({
  supplierId: z.string().min(1),
  sourceType: z.string().min(1),
  sourceId: z.string().min(1),
  dueDate: z.string().datetime(),
  amount: z.number().positive(),
});
export const updatePayableSchema = z.object({
  status: z.enum(["open", "partial", "paid", "overdue", "cancelled"]).optional(),
});
export const applyPaymentSchema = z.object({
  code: z.string().min(2),
  cashAccountId: z.string().min(1),
  amount: z.number().positive(),
  allocations: z.array(z.object({ payableId: z.string().min(1), amount: z.number().positive() })).min(1),
});
export const transferFundsSchema = z.object({
  fromCashAccountId: z.string().min(1),
  toCashAccountId: z.string().min(1),
  amount: z.number().positive(),
  reference: z.string().optional(),
});
export const reconcileBankSchema = z.object({
  cashAccountId: z.string().min(1),
  period: z.string().min(4),
  status: z.string().min(3),
});

export type CreatePayableDto = z.infer<typeof createPayableSchema>;
export type UpdatePayableDto = z.infer<typeof updatePayableSchema>;
export type ApplyPaymentDto = z.infer<typeof applyPaymentSchema>;
export type TransferFundsDto = z.infer<typeof transferFundsSchema>;
export type ReconcileBankDto = z.infer<typeof reconcileBankSchema>;

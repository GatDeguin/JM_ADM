import { z } from "zod";

export const createExpenseSchema = z.object({
  amount: z.number().positive(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
});
export const updateExpenseSchema = z.object({
  amount: z.number().positive().optional(),
  status: z.enum(["open", "partial", "paid", "overdue", "cancelled"]).optional(),
});
export const expenseActionSchema = z.object({});

export type CreateExpenseDto = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseDto = z.infer<typeof updateExpenseSchema>;
export type ExpenseActionDto = z.infer<typeof expenseActionSchema>;

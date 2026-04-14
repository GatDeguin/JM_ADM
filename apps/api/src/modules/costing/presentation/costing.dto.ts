import { z } from "zod";

export const createMonthlyCloseSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  status: z.string().default("open"),
});
export const updateMonthlyCloseSchema = z.object({ status: z.string().min(1) });
export const monthlyCloseActionSchema = z.object({});

export type CreateMonthlyCloseDto = z.infer<typeof createMonthlyCloseSchema>;
export type UpdateMonthlyCloseDto = z.infer<typeof updateMonthlyCloseSchema>;
export type MonthlyCloseActionDto = z.infer<typeof monthlyCloseActionSchema>;

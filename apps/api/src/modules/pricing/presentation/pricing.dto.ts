import { z } from "zod";

export const createPriceListSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  startsAt: z.string().datetime(),
});
export const updatePriceListSchema = z.object({
  name: z.string().min(2).optional(),
  status: z.enum(["draft", "active", "inactive", "pending_homologation", "archived"]).optional(),
});
export const priceListActionSchema = z.object({});

export type CreatePriceListDto = z.infer<typeof createPriceListSchema>;
export type UpdatePriceListDto = z.infer<typeof updatePriceListSchema>;
export type PriceListActionDto = z.infer<typeof priceListActionSchema>;

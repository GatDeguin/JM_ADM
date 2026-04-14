import { z } from "zod";

export const createCustomerSchema = z.object({ code: z.string().min(2), name: z.string().min(2) });
export const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  status: z.enum(["draft", "active", "inactive", "pending_homologation", "archived"]).optional(),
});
export const customerActionSchema = z.object({});

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>;
export type CustomerActionDto = z.infer<typeof customerActionSchema>;

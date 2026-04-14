import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  passwordHash: z.string().min(4),
});
export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  status: z.enum(["draft", "active", "inactive", "pending_homologation", "archived"]).optional(),
});
export const userActionSchema = z.object({});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type UserActionDto = z.infer<typeof userActionSchema>;

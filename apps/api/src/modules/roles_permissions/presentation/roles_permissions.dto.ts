import { z } from "zod";

export const createRoleSchema = z.object({ name: z.string().min(2) });
export const updateRoleSchema = z.object({ name: z.string().min(2) });
export const roleActionSchema = z.object({ permissionId: z.string().min(1) });

export type CreateRoleDto = z.infer<typeof createRoleSchema>;
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
export type RoleActionDto = z.infer<typeof roleActionSchema>;

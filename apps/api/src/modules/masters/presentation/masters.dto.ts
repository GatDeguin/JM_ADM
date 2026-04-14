import { z } from "zod";
import { contextualEntityTypes } from "../domain/masters.types";

export const createUnitSchema = z.object({ code: z.string().min(1), name: z.string().min(1) });
export const updateUnitSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["draft", "active", "inactive", "pending_homologation", "archived"]).optional(),
});
export const unitActionSchema = z.object({});
export const contextualEntityTypeSchema = z.enum(contextualEntityTypes);
export const createContextualEntitySchema = z.object({
  label: z.string().min(1),
  meta: z.string().optional(),
  originFlow: z.string().min(1).optional(),
});

export type CreateUnitDto = z.infer<typeof createUnitSchema>;
export type UpdateUnitDto = z.infer<typeof updateUnitSchema>;
export type UnitActionDto = z.infer<typeof unitActionSchema>;
export type CreateContextualEntityDto = z.infer<typeof createContextualEntitySchema>;

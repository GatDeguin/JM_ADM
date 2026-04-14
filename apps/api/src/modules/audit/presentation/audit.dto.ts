import { z } from "zod";

export const createAuditLogSchema = z.object({
  entity: z.string().min(1),
  entityId: z.string().min(1),
  action: z.string().min(1),
  origin: z.string().optional(),
  userId: z.string().optional(),
});
export const updateAuditLogSchema = z.object({ origin: z.string().optional() });
export const auditLogActionSchema = z.object({ after: z.record(z.any()) });

export type CreateAuditLogDto = z.infer<typeof createAuditLogSchema>;
export type UpdateAuditLogDto = z.infer<typeof updateAuditLogSchema>;
export type AuditLogActionDto = z.infer<typeof auditLogActionSchema>;

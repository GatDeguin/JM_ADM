export type AuditLogDto = {
  id: string;
  entity: string;
  entityId: string;
  action: string;
  origin: string | null;
  userId: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  createdAt: Date;
};
export type CreateAuditLogInput = { entity: string; entityId: string; action: string; origin?: string; userId?: string };
export type UpdateAuditLogInput = { origin?: string };
export type ActionAuditLogInput = { after: Record<string, unknown> };

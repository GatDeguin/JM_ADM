import { z } from "zod";

const decisionEnum = z.enum(["approved", "rejected", "reprocess"]);
const processEnum = z.enum(["production", "packaging", "dispatch"]);
const nonConformityActionEnum = z.enum(["retener", "reprocesar", "rechazar"]);

export const createQCRecordSchema = z.object({
  batchId: z.string().min(1),
  decision: decisionEnum,
  process: processEnum.optional(),
  notes: z.string().optional(),
  checklistItems: z.array(z.object({ checklistItem: z.string().min(1), passed: z.boolean(), note: z.string().optional() })).min(1),
});
export const updateQCRecordSchema = z.object({ decision: decisionEnum.optional(), notes: z.string().optional() });
export const qcRecordActionSchema = z.object({ severity: z.string().min(1), action: nonConformityActionEnum, note: z.string().optional() });

export type CreateQCRecordDto = z.infer<typeof createQCRecordSchema>;
export type UpdateQCRecordDto = z.infer<typeof updateQCRecordSchema>;
export type QCRecordActionDto = z.infer<typeof qcRecordActionSchema>;
export type QCProcessDto = z.infer<typeof processEnum>;

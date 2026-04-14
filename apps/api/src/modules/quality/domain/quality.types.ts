export type QCRecordDto = { id: string; batchId: string; decision: string; notes: string | null; createdAt: Date };
export type CreateQCRecordInput = { batchId: string; decision: string; notes?: string };
export type UpdateQCRecordInput = { decision?: string; notes?: string };
export type ActionQCRecordInput = { severity: string; action: string };

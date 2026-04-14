export type QCDecision = "approved" | "rejected" | "reprocess";

export type QCRecordDto = { id: string; batchId: string; decision: QCDecision; notes: string | null; createdAt: Date };
export type CreateQCRecordInput = {
  batchId: string;
  decision: QCDecision;
  notes?: string;
  checklistItems: Array<{ checklistItem: string; passed: boolean; note?: string }>;
};
export type UpdateQCRecordInput = { decision?: QCDecision; notes?: string };
export type ActionQCRecordInput = { severity: string; action: string };

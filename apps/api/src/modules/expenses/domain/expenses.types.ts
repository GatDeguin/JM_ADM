export type ExpenseDto = { id: string; amount: unknown; status: string; supplierId: string | null; categoryId: string | null; date: Date };
export type CreateExpenseInput = { amount: number; categoryId?: string; supplierId?: string };
export type UpdateExpenseInput = { amount?: number; status?: string };
export type ActionExpenseInput = Record<string, never>;

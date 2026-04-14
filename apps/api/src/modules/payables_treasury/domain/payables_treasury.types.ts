export type AccountsPayableDto = { id: string; supplierId: string; sourceType: string; sourceId: string; dueDate: Date; amount: unknown; balance: unknown; status: string };
export type CreateAccountsPayableInput = { supplierId: string; sourceType: string; sourceId: string; dueDate: string; amount: number };
export type UpdateAccountsPayableInput = { status?: string };
export type ActionAccountsPayableInput = { code: string; cashAccountId: string; amount: number };

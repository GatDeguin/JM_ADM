export type AccountsReceivableDto = { id: string; customerId: string; salesOrderId: string; dueDate: Date; amount: unknown; balance: unknown; status: string };
export type CreateAccountsReceivableInput = { customerId: string; salesOrderId: string; dueDate: string; amount: number };
export type UpdateAccountsReceivableInput = { status?: string };
export type ReceiptAllocationInput = { receivableId: string; amount: number };
export type ActionAccountsReceivableInput = { code: string; cashAccountId: string; amount: number; allocations: ReceiptAllocationInput[] };

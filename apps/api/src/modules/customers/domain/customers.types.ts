export type CustomerDto = { id: string; code: string; name: string; status: string };
export type CreateCustomerInput = { code: string; name: string };
export type UpdateCustomerInput = { name?: string; status?: string };
export type ActionCustomerInput = Record<string, never>;

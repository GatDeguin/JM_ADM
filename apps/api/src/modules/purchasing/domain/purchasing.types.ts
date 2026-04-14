export type PurchaseOrderDto = { id: string; code: string; supplierId: string; status: string };
export type CreatePurchaseOrderInput = { code: string; supplierId: string; status: string };
export type UpdatePurchaseOrderInput = { status?: string };
export type ActionPurchaseOrderInput = Record<string, never>;

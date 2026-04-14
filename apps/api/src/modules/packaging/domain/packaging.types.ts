export type PackagingOrderDto = { id: string; code: string; parentBatchId: string; skuId: string; qty: unknown; status: string };
export type CreatePackagingOrderInput = { code: string; parentBatchId: string; skuId: string; qty: number };
export type UpdatePackagingOrderInput = { qty?: number; status?: string };
export type ActionPackagingOrderInput = Record<string, never>;

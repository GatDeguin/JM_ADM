export type PriceListDto = { id: string; code: string; name: string; startsAt: Date; status: string };
export type CreatePriceListInput = { code: string; name: string; startsAt: string };
export type UpdatePriceListInput = { name?: string; status?: string };
export type ActionPriceListInput = Record<string, never>;

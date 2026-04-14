export type UnitDto = { id: string; code: string; name: string; status: string };
export type CreateUnitInput = { code: string; name: string };
export type UpdateUnitInput = { name?: string; status?: string };
export type ActionUnitInput = Record<string, never>;

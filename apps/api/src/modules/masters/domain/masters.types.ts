export type UnitDto = { id: string; code: string; name: string; status: string };
export type CreateUnitInput = { code: string; name: string };
export type UpdateUnitInput = { name?: string; status?: string };
export type ActionUnitInput = Record<string, never>;

export const contextualEntityTypes = [
  "presentacion",
  "unidad",
  "sku",
  "alias",
  "proveedor",
  "cliente",
  "lista",
  "cuenta"
] as const;

export type ContextualEntityType = (typeof contextualEntityTypes)[number];

export type ContextualOptionDto = {
  id: string;
  label: string;
  meta?: string;
};

export type CreateContextualEntityInput = {
  label: string;
  meta?: string;
  originFlow?: string;
};

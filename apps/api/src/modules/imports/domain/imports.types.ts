export const supportedImportTypes = [
  "formulas",
  "production_journals",
  "customers",
  "suppliers",
  "price_lists",
  "historical_sales",
  "expenses",
  "opening_stock",
] as const;

export type SupportedImportType = (typeof supportedImportTypes)[number];

export type ImportSummary = {
  type: SupportedImportType;
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  pendingHomologation: number;
  imported?: number;
};

export type ImportedRecord = {
  key: string;
  originalValue: Record<string, unknown>;
  canonicalValue: Record<string, unknown>;
  warnings: string[];
  suggestions: string[];
  duplicate: boolean;
  valid: boolean;
  pendingHomologation: boolean;
};

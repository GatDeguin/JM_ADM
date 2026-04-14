import { normalizeText } from "../../modules/imports/domain/import-normalization";
import type { SupportedImportType } from "../../modules/imports/domain/imports.types";

function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return Number(value.replace(/,/g, "."));
  }
  return Number.NaN;
}

export function collectImportBusinessWarnings(
  type: SupportedImportType,
  normalizedRow: Record<string, unknown>,
  rowIndex: number,
): string[] {
  const warnings: string[] = [];
  const line = rowIndex + 1;

  if (type === "price_lists") {
    const price = toNumber(normalizedRow.price);
    if (!Number.isFinite(price) || price <= 0) {
      warnings.push(`Fila ${line}: el precio de lista debe ser mayor a 0`);
    }
  }

  if (type === "opening_stock") {
    const qty = toNumber(normalizedRow.qty);
    if (!Number.isFinite(qty) || qty < 0) {
      warnings.push(`Fila ${line}: el stock inicial no puede ser negativo`);
    }
  }

  if (type === "historical_sales") {
    const qty = toNumber(normalizedRow.qty);
    if (!Number.isFinite(qty) || qty <= 0) {
      warnings.push(`Fila ${line}: la cantidad de venta debe ser mayor a 0`);
    }
  }

  if (type === "customers" || type === "suppliers") {
    const homologationStatus = normalizeText(normalizedRow.status ?? normalizedRow.estado ?? "");
    if (homologationStatus === "rechazado") {
      warnings.push(`Fila ${line}: la homologación está rechazada, revisar antes de importar`);
    }
  }

  return warnings;
}

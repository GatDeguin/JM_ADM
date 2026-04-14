import { Injectable } from "@nestjs/common";
import { ImportedRecord, ImportSummary, SupportedImportType, supportedImportTypes } from "../domain/imports.types";
import { isPendingHomologation, normalizeCode, normalizeText } from "../domain/import-normalization";

type ImporterDefinition = {
  type: SupportedImportType;
  requiredFields: string[];
  aliases?: Record<string, string>;
  keyBuilder: (row: Record<string, unknown>) => string;
};

const importerDefinitions: ImporterDefinition[] = [
  { type: "formulas", requiredFields: ["code", "name"], aliases: { codigo: "code", nombre: "name" }, keyBuilder: (r) => normalizeCode(r.code ?? r.name) },
  {
    type: "production_journals",
    requiredFields: ["date", "batch", "product"],
    aliases: { fecha: "date", lote: "batch", producto: "product" },
    keyBuilder: (r) => normalizeCode(`${r.date}-${r.batch}-${r.product}`),
  },
  { type: "customers", requiredFields: ["code", "name"], aliases: { cliente: "name", codigo: "code" }, keyBuilder: (r) => normalizeCode(r.code ?? r.name) },
  { type: "suppliers", requiredFields: ["code", "name"], aliases: { proveedor: "name", codigo: "code" }, keyBuilder: (r) => normalizeCode(r.code ?? r.name) },
  {
    type: "price_lists",
    requiredFields: ["code", "sku", "price"],
    aliases: { lista: "code", precio: "price" },
    keyBuilder: (r) => normalizeCode(`${r.code}-${r.sku}`),
  },
  {
    type: "historical_sales",
    requiredFields: ["date", "customer", "sku", "qty"],
    aliases: { fecha: "date", cliente: "customer", cantidad: "qty" },
    keyBuilder: (r) => normalizeCode(`${r.date}-${r.customer}-${r.sku}`),
  },
  {
    type: "expenses",
    requiredFields: ["date", "category", "amount"],
    aliases: { fecha: "date", categoria: "category", monto: "amount" },
    keyBuilder: (r) => normalizeCode(`${r.date}-${r.category}-${r.amount}`),
  },
  {
    type: "opening_stock",
    requiredFields: ["item", "warehouse", "qty"],
    aliases: { articulo: "item", almacen: "warehouse", cantidad: "qty" },
    keyBuilder: (r) => normalizeCode(`${r.item}-${r.warehouse}`),
  },
];

@Injectable()
export class ImportersService {
  isSupported(type: string): type is SupportedImportType {
    return (supportedImportTypes as readonly string[]).includes(type);
  }

  process(type: SupportedImportType, rows: Record<string, unknown>[]): { records: ImportedRecord[]; summary: ImportSummary; warnings: string[] } {
    const definition = importerDefinitions.find((item) => item.type === type);
    if (!definition) {
      return {
        records: [],
        summary: { type, total: 0, valid: 0, invalid: 0, duplicates: 0, pendingHomologation: 0 },
        warnings: ["Tipo de importación no soportado"],
      };
    }

    const seenKeys = new Set<string>();
    const warnings: string[] = [];

    const records = rows.map((originalRow, index) => {
      const normalized = this.normalizeRow(originalRow, definition.aliases);
      const key = definition.keyBuilder(normalized);
      const rowWarnings: string[] = [];

      for (const requiredField of definition.requiredFields) {
        if (!normalized[requiredField]) {
          rowWarnings.push(`Fila ${index + 1}: falta ${requiredField}`);
        }
      }

      const duplicate = seenKeys.has(key);
      if (!duplicate) {
        seenKeys.add(key);
      } else {
        rowWarnings.push(`Fila ${index + 1}: duplicado por llave ${key}`);
      }

      const pendingHomologation = isPendingHomologation(
        normalized.pending_homologation ?? normalized.pendingHomologation ?? normalized.homologacion,
      );

      if (pendingHomologation) {
        normalized.status = "pending_homologation";
      }

      warnings.push(...rowWarnings);

      return {
        key,
        normalized,
        warnings: rowWarnings,
        duplicate,
        valid: rowWarnings.length === 0,
        pendingHomologation,
      };
    });

    const summary: ImportSummary = {
      type,
      total: records.length,
      valid: records.filter((item) => item.valid).length,
      invalid: records.filter((item) => !item.valid).length,
      duplicates: records.filter((item) => item.duplicate).length,
      pendingHomologation: records.filter((item) => item.pendingHomologation).length,
    };

    return { records, summary, warnings };
  }

  private normalizeRow(row: Record<string, unknown>, aliases: Record<string, string> = {}) {
    const normalized: Record<string, unknown> = {};

    for (const [rawKey, value] of Object.entries(row)) {
      const key = aliases[normalizeText(rawKey)] ?? normalizeText(rawKey).replace(/\s+/g, "_");
      normalized[key] = typeof value === "string" ? normalizeText(value) : value;
    }

    return normalized;
  }
}

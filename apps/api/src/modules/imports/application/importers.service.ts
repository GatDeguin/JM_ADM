import { Injectable } from "@nestjs/common";
import { ImportedRecord, ImportSummary, SupportedImportType, supportedImportTypes } from "../domain/imports.types";
import { isPendingHomologation, normalizeCode, normalizeText } from "../domain/import-normalization";
import { collectImportBusinessWarnings } from "../../../common/domain-rules/import-domain-rules";

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

  process(
    type: SupportedImportType,
    rows: Record<string, unknown>[],
    mapping: Record<string, string> = {},
  ): { records: ImportedRecord[]; summary: ImportSummary; warnings: string[] } {
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
      const canonicalValue = this.normalizeRow(originalRow, definition.aliases, mapping);
      const key = definition.keyBuilder(canonicalValue);
      const rowWarnings: string[] = [];

      for (const requiredField of definition.requiredFields) {
        if (!canonicalValue[requiredField]) {
          rowWarnings.push(`Fila ${index + 1}: falta ${requiredField}`);
        }
      }

      rowWarnings.push(...collectImportBusinessWarnings(type, canonicalValue, index));

      const duplicate = seenKeys.has(key);
      if (!duplicate) {
        seenKeys.add(key);
      } else {
        rowWarnings.push(`Fila ${index + 1}: duplicado por llave ${key}`);
      }

      const pendingHomologation = isPendingHomologation(
        canonicalValue.pending_homologation ?? canonicalValue.pendingHomologation ?? canonicalValue.homologacion,
      );

      if (pendingHomologation) {
        canonicalValue.status = "pending_homologation";
      }

      const suggestions = this.buildSuggestions(canonicalValue, { duplicate, pendingHomologation, requiredFields: definition.requiredFields });

      warnings.push(...rowWarnings);

      return {
        key,
        originalValue: originalRow,
        canonicalValue,
        warnings: rowWarnings,
        suggestions,
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

  private normalizeRow(row: Record<string, unknown>, aliases: Record<string, string> = {}, mapping: Record<string, string> = {}) {
    const normalized: Record<string, unknown> = {};
    const normalizedMapping = Object.fromEntries(
      Object.entries(mapping).map(([rawSource, target]) => [normalizeText(rawSource), normalizeText(target).replace(/\s+/g, "_")]),
    );

    for (const [rawKey, value] of Object.entries(row)) {
      const sourceKey = normalizeText(rawKey).replace(/\s+/g, "_");
      const key = normalizedMapping[sourceKey] ?? aliases[sourceKey] ?? sourceKey;
      normalized[key] = typeof value === "string" ? normalizeText(value) : value;
    }

    return normalized;
  }

  private buildSuggestions(
    canonicalValue: Record<string, unknown>,
    options: { duplicate: boolean; pendingHomologation: boolean; requiredFields: string[] },
  ) {
    const suggestions: string[] = [];

    if (options.pendingHomologation) {
      suggestions.push("Revisar homologación: crear alias o vincular con maestro existente");
    }

    if (options.duplicate) {
      suggestions.push("Duplicado detectado: sugerido merge con registro previo por llave canónica");
    }

    const missingRequired = options.requiredFields.filter((field) => !canonicalValue[field]);
    if (missingRequired.length > 0) {
      suggestions.push(`Completar campos requeridos: ${missingRequired.join(", ")}`);
    }

    return suggestions;
  }
}

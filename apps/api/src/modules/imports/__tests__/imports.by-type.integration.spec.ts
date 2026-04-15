import { describe, expect, it } from "vitest";
import { ImportersService } from "../application/importers.service";

describe("imports por tipo", () => {
  const service = new ImportersService();

  it("formulas: detecta faltantes y aplica mapping", () => {
    const result = service.process(
      "formulas",
      [
        { CodigoOriginal: "F-01", NombreOriginal: "Fórmula 1" },
        { NombreOriginal: "Sin código" },
      ],
      { codigooriginal: "code", nombreoriginal: "name" },
    );

    expect(result.summary.total).toBe(2);
    expect(result.summary.invalid).toBe(1);
    expect(result.records[0].canonicalValue.code).toBe("f-01");
  });

  it("customers: marca pending_homologation por estado rechazado con warning", () => {
    const result = service.process("customers", [{ codigo: "C-01", cliente: "Cliente", estado: "rechazado", homologacion: "si" }]);
    expect(result.summary.pendingHomologation).toBe(1);
    expect(result.records[0].suggestions.some((message) => message.includes("homologación"))).toBe(true);
  });

  it("suppliers: soporta pending_homologation", () => {
    const result = service.process("suppliers", [{ codigo: "S-01", proveedor: "Proveedor", homologacion: "si" }]);
    expect(result.summary.pendingHomologation).toBe(1);
    expect(result.records[0].canonicalValue.status).toBe("pending_homologation");
  });

  it("price_lists: valida precio mayor a cero", () => {
    const result = service.process("price_lists", [{ lista: "LP-1", sku: "SKU-1", precio: 0 }]);
    expect(result.summary.invalid).toBe(1);
    expect(result.warnings.some((message) => message.includes("precio"))).toBe(true);
  });

  it("historical_sales: valida qty mayor a cero", () => {
    const result = service.process("historical_sales", [{ date: "2026-01-01", customer: "C-1", sku: "SKU-1", qty: 0 }]);
    expect(result.summary.invalid).toBe(1);
  });

  it("expenses: admite fila válida", () => {
    const result = service.process("expenses", [{ date: "2026-01-01", category: "flete", amount: 1200 }]);
    expect(result.summary.valid).toBe(1);
  });

  it("opening_stock: valida no negativo", () => {
    const result = service.process("opening_stock", [{ item: "ITEM-1", warehouse: "DEP-1", qty: -1 }]);
    expect(result.summary.invalid).toBe(1);
    expect(result.warnings[0]).toContain("stock inicial");
  });
});

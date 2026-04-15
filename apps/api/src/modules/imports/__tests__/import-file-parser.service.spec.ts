import { describe, expect, it, vi } from "vitest";
import { utils, write } from "xlsx";
import { ImportFileParserService } from "../application/import-file-parser.service";
import mammoth from "mammoth";

vi.mock("mammoth", () => ({
  default: {
    extractRawText: vi.fn(async () => ({ value: "| codigo | nombre |\n| F-1 | Formula Uno |" })),
  },
}));

describe("ImportFileParserService", () => {
  const service = new ImportFileParserService();

  it("parsea tablas de texto", async () => {
    const result = await service.parse({ fileName: "formulas.txt", contentBase64: Buffer.from("codigo;nombre\nF-1;Formula Uno").toString("base64") });
    expect(result.rows).toEqual([{ codigo: "F-1", nombre: "Formula Uno" }]);
    expect(result.detectedColumns).toEqual(["codigo", "nombre"]);
  });

  it("parsea csv", async () => {
    const result = await service.parse({ fileName: "customers.csv", contentBase64: Buffer.from("codigo,cliente\nC-1,Cliente Uno").toString("base64") });
    expect(result.rows[0].codigo).toBe("C-1");
  });

  it("parsea xlsx", async () => {
    const workbook = utils.book_new();
    const worksheet = utils.json_to_sheet([{ codigo: "S-1", proveedor: "Proveedor Uno" }]);
    utils.book_append_sheet(workbook, worksheet, "sheet1");
    const buffer = write(workbook, { type: "buffer", bookType: "xlsx" });

    const result = await service.parse({ fileName: "suppliers.xlsx", contentBase64: buffer.toString("base64") });
    expect(result.rows[0].codigo).toBe("S-1");
  });

  it("parsea docx usando extractor de texto", async () => {
    const result = await service.parse({ fileName: "formulas.docx", contentBase64: Buffer.from("fake").toString("base64") });
    expect(mammoth.extractRawText).toHaveBeenCalled();
    expect(result.rows[0].codigo).toBe("F-1");
  });
});

import { Injectable } from "@nestjs/common";
import { read, utils } from "xlsx";
import mammoth from "mammoth";

export type ImportUploadPayload = {
  rows?: Record<string, unknown>[];
  fileName?: string;
  mimeType?: string;
  contentBase64?: string;
};

export type ImportParseFeedback = {
  rowNumber: number;
  level: "warning" | "error";
  message: string;
};

export type ImportParseResult = {
  rows: Record<string, unknown>[];
  detectedColumns: string[];
  feedback: ImportParseFeedback[];
};

@Injectable()
export class ImportFileParserService {
  async parse(payload: ImportUploadPayload): Promise<ImportParseResult> {
    if (Array.isArray(payload.rows) && payload.rows.length > 0) {
      return {
        rows: payload.rows,
        detectedColumns: Object.keys(payload.rows[0] ?? {}),
        feedback: [],
      };
    }

    const buffer = this.decodeBase64(payload.contentBase64);
    const extension = this.fileExtension(payload.fileName);

    if (extension === "docx" || payload.mimeType?.includes("wordprocessingml")) {
      const text = await mammoth.extractRawText({ buffer });
      return this.parseTextTable(text.value);
    }

    if (extension === "txt" || extension === "md") {
      return this.parseTextTable(buffer.toString("utf8"));
    }

    if (extension === "csv" || extension === "xlsx" || payload.mimeType?.includes("sheet")) {
      return this.parseSpreadsheet(buffer, extension === "csv");
    }

    return this.parseTextTable(buffer.toString("utf8"));
  }

  private decodeBase64(contentBase64?: string) {
    if (!contentBase64) {
      return Buffer.from("");
    }

    const normalized = contentBase64.includes(",") ? contentBase64.split(",").pop() ?? "" : contentBase64;
    return Buffer.from(normalized, "base64");
  }

  private fileExtension(fileName?: string) {
    if (!fileName || !fileName.includes(".")) {
      return "";
    }
    return fileName.split(".").pop()?.toLowerCase() ?? "";
  }

  private parseSpreadsheet(buffer: Buffer, csv = false): ImportParseResult {
    const workbook = read(buffer, { type: "buffer", raw: false, codepage: csv ? 65001 : undefined });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return { rows: [], detectedColumns: [], feedback: [{ rowNumber: 0, level: "error", message: "No se encontraron hojas para importar." }] };
    }

    const rows = utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], {
      defval: "",
      raw: false,
    });
    return {
      rows,
      detectedColumns: Object.keys(rows[0] ?? {}),
      feedback: [],
    };
  }

  private parseTextTable(content: string): ImportParseResult {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line) => !/^[-|\s]+$/.test(line));

    if (!lines.length) {
      return {
        rows: [],
        detectedColumns: [],
        feedback: [{ rowNumber: 0, level: "error", message: "El archivo no contiene filas legibles." }],
      };
    }

    const separator = lines[0].includes("|") ? "|" : /\t/.test(lines[0]) ? "\t" : ";";
    const splitLine = (line: string) =>
      line
        .split(separator)
        .map((cell) => cell.trim())
        .filter((cell, index, arr) => !(separator === "|" && ((index === 0 && cell === "") || (index === arr.length - 1 && cell === ""))));

    const headers = splitLine(lines[0]);
    const rows: Record<string, unknown>[] = [];
    const feedback: ImportParseFeedback[] = [];

    for (const [index, line] of lines.slice(1).entries()) {
      const values = splitLine(line);
      if (!values.length) {
        continue;
      }

      if (values.length !== headers.length) {
        feedback.push({
          rowNumber: index + 2,
          level: "warning",
          message: `Cantidad de columnas inconsistente (esperadas: ${headers.length}, recibidas: ${values.length}).`,
        });
      }

      const row: Record<string, unknown> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ?? "";
      });
      rows.push(row);
    }

    return {
      rows,
      detectedColumns: headers,
      feedback,
    };
  }
}

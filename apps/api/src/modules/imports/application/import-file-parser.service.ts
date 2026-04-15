import { Injectable } from "@nestjs/common";
import { read, utils } from "xlsx";
import mammoth from "mammoth";

export type ImportUploadPayload = {
  rows?: Record<string, unknown>[];
  fileName?: string;
  mimeType?: string;
  contentBase64?: string;
};

@Injectable()
export class ImportFileParserService {
  async parse(payload: ImportUploadPayload): Promise<Record<string, unknown>[]> {
    if (Array.isArray(payload.rows) && payload.rows.length > 0) {
      return payload.rows;
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

  private parseSpreadsheet(buffer: Buffer, csv = false): Record<string, unknown>[] {
    const workbook = read(buffer, { type: "buffer", raw: false, codepage: csv ? 65001 : undefined });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return [];
    }

    return utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], {
      defval: "",
      raw: false,
    });
  }

  private parseTextTable(content: string): Record<string, unknown>[] {
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line) => !/^[-|\s]+$/.test(line));

    if (!lines.length) {
      return [];
    }

    const separator = lines[0].includes("|") ? "|" : /\t/.test(lines[0]) ? "\t" : ";";
    const splitLine = (line: string) =>
      line
        .split(separator)
        .map((cell) => cell.trim())
        .filter((cell, index, arr) => !(separator === "|" && ((index === 0 && cell === "") || (index === arr.length - 1 && cell === ""))));

    const headers = splitLine(lines[0]);
    const rows: Record<string, unknown>[] = [];

    for (const line of lines.slice(1)) {
      const values = splitLine(line);
      if (!values.length) {
        continue;
      }

      const row: Record<string, unknown> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ?? "";
      });
      rows.push(row);
    }

    return rows;
  }
}

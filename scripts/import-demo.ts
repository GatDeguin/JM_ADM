import { readFileSync } from "node:fs";
import { join } from "node:path";
import { utils, write } from "xlsx";
import { ImportsService } from "../apps/api/src/modules/imports/application/imports.service";
import { ImportersService } from "../apps/api/src/modules/imports/application/importers.service";
import { ImportFileParserService } from "../apps/api/src/modules/imports/application/import-file-parser.service";

type Job = {
  id: string;
  type: string;
  sourceName: string;
  status: string;
  mapping?: Record<string, string>;
  summary?: Record<string, unknown>;
  warnings?: string[];
  originals?: Record<string, unknown>[];
};

class InMemoryImportsRepository {
  private jobs = new Map<string, Job>();
  private idCounter = 1;

  createJob(type: string, sourceName: string) {
    const id = `job-${this.idCounter++}`;
    const job: Job = { id, type, sourceName, status: "uploaded", summary: {}, warnings: [], originals: [] };
    this.jobs.set(id, job);
    return Promise.resolve(job);
  }

  findById(id: string) {
    return Promise.resolve(this.jobs.get(id) ?? null);
  }

  updateJob(id: string, data: Record<string, unknown>) {
    const current = this.jobs.get(id);
    if (!current) throw new Error(`Job ${id} no encontrado`);
    const updated = { ...current, ...data } as Job;
    this.jobs.set(id, updated);
    return Promise.resolve(updated);
  }

  appendAudit() {
    return Promise.resolve();
  }
}

class InMemoryImportQueueService {
  enqueueImport() {
    return Promise.resolve({ queued: true });
  }
}

async function run() {
  const importsRepository = new InMemoryImportsRepository();
  const importsService = new ImportsService(
    importsRepository as never,
    new ImportersService(),
    new InMemoryImportQueueService() as never,
    new ImportFileParserService(),
  );

  const formulasPath = join(process.cwd(), "scripts/fixtures/imports/formulas-table.txt");
  const customersCsvPath = join(process.cwd(), "scripts/fixtures/imports/customers.csv");
  const suppliersCsvPath = join(process.cwd(), "scripts/fixtures/imports/suppliers.csv");

  const suppliersXlsxBuffer = buildSuppliersXlsx([
    { codigo: "SX-001", proveedor: "Proveedor X", homologacion: "no" },
    { codigo: "SX-002", proveedor: "Proveedor Y", homologacion: "si" },
  ]);

  const runs = [
    {
      type: "formulas",
      sourceName: "formulas-table.txt",
      payload: { fileName: "formulas-table.txt", mimeType: "text/plain", contentBase64: readFileSync(formulasPath).toString("base64") },
      mapping: { codigo: "code", nombre: "name", homologacion: "pending_homologation" },
    },
    {
      type: "customers",
      sourceName: "customers.csv",
      payload: { fileName: "customers.csv", mimeType: "text/csv", contentBase64: readFileSync(customersCsvPath).toString("base64") },
      mapping: { codigo: "code", cliente: "name", estado: "status" },
    },
    {
      type: "suppliers",
      sourceName: "suppliers.csv",
      payload: { fileName: "suppliers.csv", mimeType: "text/csv", contentBase64: readFileSync(suppliersCsvPath).toString("base64") },
      mapping: { codigo: "code", proveedor: "name", homologacion: "pending_homologation" },
    },
    {
      type: "suppliers",
      sourceName: "suppliers.xlsx",
      payload: {
        fileName: "suppliers.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        contentBase64: suppliersXlsxBuffer.toString("base64"),
      },
      mapping: { codigo: "code", proveedor: "name", homologacion: "pending_homologation" },
    },
  ];

  for (const runConfig of runs) {
    const job = await importsService.createJob(runConfig.type, runConfig.sourceName);
    await importsService.uploadFile(job.id, runConfig.sourceName, runConfig.payload);
    await importsService.defineMapping(job.id, runConfig.mapping);
    const prevalidated = await importsService.prevalidate(job.id);
    const preview = await importsService.preview(job.id);
    const confirmed = await importsService.confirm(job.id);

    console.log("\n=== Import demo ===");
    console.log(`job=${job.id} type=${runConfig.type} source=${runConfig.sourceName}`);
    console.log("summary", prevalidated.summary);
    console.log("preview_first_row", preview.preview[0]);
    console.log("confirm", confirmed);
  }
}

function buildSuppliersXlsx(rows: Array<Record<string, unknown>>) {
  const workbook = utils.book_new();
  const worksheet = utils.json_to_sheet(rows);
  utils.book_append_sheet(workbook, worksheet, "suppliers");
  return write(workbook, { type: "buffer", bookType: "xlsx" });
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

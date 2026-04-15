import { describe, expect, it } from "vitest";
import { ImportFileParserService } from "../application/import-file-parser.service";
import { ImportProcessorService } from "../application/import-processor.service";
import { ImportersService } from "../application/importers.service";
import { ImportsService } from "../application/imports.service";

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
  private readonly jobs = new Map<string, Job>();
  private readonly audits: Array<{ entityId: string; action: string; origin: string; after?: unknown }> = [];
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

  appendAudit(input: { entityId: string; action: string; origin: string; after?: unknown }) {
    this.audits.push(input);
    return Promise.resolve();
  }

  applyRecord() {
    return Promise.resolve({ entity: "Customer", state: "created", warnings: [] as string[] });
  }

  getAuditActions(entityId: string) {
    return this.audits.filter((entry) => entry.entityId === entityId).map((entry) => entry.action);
  }

  getJob(id: string) {
    return this.jobs.get(id);
  }
}

class InMemoryImportQueueService {
  enqueueImport() {
    return Promise.resolve({ queued: true });
  }
}

describe("import demo real con persistencia y auditoría", () => {
  it("persiste el job y registra auditoría verificable hasta import.finished", async () => {
    const importsRepository = new InMemoryImportsRepository();
    const importersService = new ImportersService();
    const importsService = new ImportsService(
      importsRepository as never,
      importersService,
      new InMemoryImportQueueService() as never,
      new ImportFileParserService(),
    );

    const processor = new ImportProcessorService(
      importsRepository as never,
      importersService,
      { emitFinished: () => undefined } as never,
    );

    const csv = Buffer.from("codigo,cliente,estado\nC-100,Cliente Demo,activo", "utf-8").toString("base64");

    const job = await importsService.createJob("customers", "demo-customers.csv");
    await importsService.uploadFile(job.id, "demo-customers.csv", {
      fileName: "demo-customers.csv",
      mimeType: "text/csv",
      contentBase64: csv,
    });
    await importsService.defineMapping(job.id, {
      codigo: "code",
      cliente: "name",
      estado: "status",
    });
    await importsService.prevalidate(job.id);
    await importsService.confirm(job.id);
    const processed = await processor.execute(job.id);

    expect(processed.status).toBe("imported");
    expect(importsRepository.getJob(job.id)?.summary).toMatchObject({
      imported: 1,
      created: 1,
      updated: 0,
      errors: 0,
    });

    expect(importsRepository.getAuditActions(job.id)).toEqual(
      expect.arrayContaining([
        "import.job.created",
        "import.file.uploaded",
        "import.mapping.defined",
        "import.prevalidated",
        "import.confirmed",
        "import.finished",
      ]),
    );
  });
});

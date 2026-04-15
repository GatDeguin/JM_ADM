import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ImportsRepository } from "../infrastructure/imports.repository";
import { ImportersService } from "./importers.service";
import { ImportEventsService } from "../infrastructure/import-events.service";

@Injectable()
export class ImportProcessorService {
  private readonly logger = new Logger(ImportProcessorService.name);

  constructor(
    private readonly importsRepository: ImportsRepository,
    private readonly importersService: ImportersService,
    private readonly importEventsService: ImportEventsService,
  ) {}

  async execute(jobId: string) {
    const job = await this.importsRepository.findById(jobId);
    if (!job) {
      throw new NotFoundException("ImportJob no encontrado");
    }

    if (!this.importersService.isSupported(job.type)) {
      throw new NotFoundException("Tipo de importación no soportado");
    }

    const rows = Array.isArray(job.originals) ? (job.originals as Record<string, unknown>[]) : [];
    const mapping = (job.mapping ?? {}) as Record<string, string>;
    const processed = this.importersService.process(job.type, rows, mapping);

    for (const record of processed.records.filter((item) => item.valid && !item.duplicate)) {
      if (job.type === "customers") {
        await this.importsRepository.upsertCustomer(
          String(record.canonicalValue.code ?? record.key),
          String(record.canonicalValue.name ?? record.key),
          record.pendingHomologation ? "pending_homologation" : "active",
        );
      }

      if (job.type === "suppliers") {
        await this.importsRepository.upsertSupplier(
          String(record.canonicalValue.code ?? record.key),
          String(record.canonicalValue.name ?? record.key),
          record.pendingHomologation ? "pending_homologation" : "active",
        );
      }
    }

    const imported = processed.records.filter((item) => item.valid && !item.duplicate).length;
    const status = processed.warnings.length ? "imported_with_warnings" : "imported";

    const updated = await this.importsRepository.updateJob(job.id, {
      status,
      summary: { ...processed.summary, imported },
      warnings: processed.warnings,
    });

    await this.importsRepository.appendAudit({
      entityId: job.id,
      action: "import.finished",
      origin: "imports.processor.execute",
      after: {
        imported,
        status,
        warnings: processed.warnings.length,
      },
    });

    this.importEventsService.emitFinished({ jobId: job.id, status, imported });
    this.logger.log(`import.finished job=${job.id} imported=${imported}`);

    return updated;
  }
}

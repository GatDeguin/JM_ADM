import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ImportsRepository } from "../infrastructure/imports.repository";
import { ImportersService } from "./importers.service";
import { ImportEventsService } from "../infrastructure/import-events.service";
import { ImportSummary } from "../domain/imports.types";

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
    const execution = this.createExecutionSummary(processed.summary);
    const warnings = [...processed.warnings];

    for (const record of processed.records) {
      if (!record.valid || record.duplicate) {
        execution.skipped += 1;
        if (record.duplicate) {
          warnings.push(`Llave ${record.key}: duplicado, sugerido merge`);
        }
        continue;
      }

      try {
        const result = await this.importsRepository.applyRecord({
          type: job.type,
          key: record.key,
          canonicalValue: record.canonicalValue,
          originalValue: record.originalValue,
          pendingHomologation: record.pendingHomologation,
        });
        this.bumpEntity(execution.entities, result.entity, result.state);
        execution[result.state] += 1;
        warnings.push(...result.warnings);
      } catch (error) {
        execution.errors += 1;
        warnings.push(`Llave ${record.key}: ${String(error)}`);
      }
    }

    const imported = execution.created + execution.updated;
    const status = execution.errors > 0 ? "failed" : warnings.length > 0 ? "imported_with_warnings" : "imported";

    const updated = await this.importsRepository.updateJob(job.id, {
      status,
      summary: { ...processed.summary, ...execution, imported },
      warnings,
    });

    await this.importsRepository.appendAudit({
      entityId: job.id,
      action: "import.finished",
      origin: "imports.processor.execute",
      after: {
        imported,
        status,
        warnings: warnings.length,
        execution,
      },
    });

    this.importEventsService.emitFinished({ jobId: job.id, status, imported });
    this.logger.log(`import.finished job=${job.id} imported=${imported}`);

    return updated;
  }

  private createExecutionSummary(base: ImportSummary) {
    return {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      entities: {} as Record<string, { created: number; updated: number; skipped: number; errors: number }>,
      pendingHomologation: base.pendingHomologation,
    };
  }

  private bumpEntity(
    entities: Record<string, { created: number; updated: number; skipped: number; errors: number }>,
    entity: string,
    state: "created" | "updated" | "skipped",
  ) {
    entities[entity] ??= { created: 0, updated: 0, skipped: 0, errors: 0 };
    entities[entity][state] += 1;
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
import {
  assertImportRowsPresent,
  assertMappingHasFields,
  assertRequiredText,
  assertSupportedImportType,
} from "../../../common/domain-rules/shared-domain-rules";
import { ImportsRepository } from "../infrastructure/imports.repository";
import { ImportersService } from "./importers.service";
import { ImportQueueService } from "../infrastructure/import-queue.service";
import { ImportFileParserService, ImportUploadPayload } from "./import-file-parser.service";

@Injectable()
export class ImportsService {
  constructor(
    private readonly importsRepository: ImportsRepository,
    private readonly importersService: ImportersService,
    private readonly importQueueService: ImportQueueService,
    private readonly importFileParserService: ImportFileParserService,
  ) {}

  async createJob(type: string, sourceName: string) {
    assertRequiredText(sourceName, "el nombre de origen");
    assertSupportedImportType(this.importersService.isSupported(type), type);

    const job = await this.importsRepository.createJob(type, sourceName);
    await this.importsRepository.appendAudit({
      entityId: job.id,
      action: "import.job.created",
      origin: "imports.createJob",
      after: { type, sourceName },
    });
    return job;
  }

  async uploadFile(id: string, sourceName: string, payload: ImportUploadPayload & { forcePendingHomologation?: boolean }) {
    await this.ensureJob(id);

    assertRequiredText(sourceName, "el nombre de archivo");
    const parseResult = await this.importFileParserService.parse(payload);
    const rows = payload.forcePendingHomologation
      ? parseResult.rows.map((row) => ({ ...row, pending_homologation: true }))
      : parseResult.rows;
    assertImportRowsPresent(rows);
    const parseWarnings = parseResult.feedback.map((item) => `Fila ${item.rowNumber}: ${item.message}`);

    const updated = await this.importsRepository.updateJob(id, {
      sourceName,
      originals: rows,
      status: "mapping",
      summary: {
        parsing: {
          detectedColumns: parseResult.detectedColumns,
          feedback: parseResult.feedback,
        },
      },
      warnings: parseWarnings,
    });

    await this.importsRepository.appendAudit({
      entityId: id,
      action: "import.file.uploaded",
      origin: "imports.uploadFile",
      after: { rows: rows.length, sourceName, detectedColumns: parseResult.detectedColumns, parseWarnings: parseResult.feedback.length },
    });
    return {
      ...updated,
      detectedColumns: parseResult.detectedColumns,
      rowFeedback: parseResult.feedback,
    };
  }

  async defineMapping(id: string, mapping: Record<string, string>) {
    await this.ensureJob(id);

    assertMappingHasFields(mapping);

    const updated = await this.importsRepository.updateJob(id, {
      mapping,
      status: "validating",
    });

    await this.importsRepository.appendAudit({
      entityId: id,
      action: "import.mapping.defined",
      origin: "imports.defineMapping",
      after: { mappingKeys: Object.keys(mapping).length },
    });
    return updated;
  }

  async prevalidate(id: string) {
    const job = await this.ensureJob(id);

    assertSupportedImportType(this.importersService.isSupported(job.type), job.type);

    const rows = Array.isArray(job.originals) ? (job.originals as Record<string, unknown>[]) : [];
    const mapping = (job.mapping ?? {}) as Record<string, string>;
    const result = this.importersService.process(job.type, rows, mapping);

    const updated = await this.importsRepository.updateJob(id, {
      status: "ready_to_import",
      summary: {
        ...result.summary,
        rowResults: result.records,
      },
      warnings: result.warnings,
    });

    await this.importsRepository.appendAudit({
      entityId: id,
      action: "import.prevalidated",
      origin: "imports.prevalidate",
      after: result.summary,
    });
    return { job: updated, warnings: result.warnings, summary: result.summary, rows: result.records };
  }

  async preview(id: string) {
    const job = await this.ensureJob(id);

    assertSupportedImportType(this.importersService.isSupported(job.type), job.type);

    const rows = Array.isArray(job.originals) ? (job.originals as Record<string, unknown>[]) : [];
    const mapping = (job.mapping ?? {}) as Record<string, string>;
    const result = this.importersService.process(job.type, rows, mapping);
    return {
      id: job.id,
      status: job.status,
      type: job.type,
      summary: result.summary,
      warnings: result.warnings,
      preview: result.records.slice(0, 50),
    };
  }

  async confirm(id: string) {
    await this.ensureJob(id);

    try {
      await this.importsRepository.updateJob(id, { status: "ready_to_import" });
      const queueResult = await this.importQueueService.enqueueImport(id);
      await this.importsRepository.appendAudit({
        entityId: id,
        action: "import.confirmed",
        origin: "imports.confirm",
        after: queueResult,
      });

      return {
        event: "import.started",
        jobId: id,
        queued: queueResult.queued,
      };
    } catch (error) {
      await this.importsRepository.updateJob(id, {
        status: "failed",
        warnings: [`Error al ejecutar importación: ${String(error)}`],
      });
      throw error;
    }
  }

  async getJob(id: string) {
    return this.ensureJob(id);
  }

  private async ensureJob(id: string) {
    const job = await this.importsRepository.findById(id);
    if (!job) {
      throw new NotFoundException("ImportJob no encontrado");
    }
    return job;
  }
}

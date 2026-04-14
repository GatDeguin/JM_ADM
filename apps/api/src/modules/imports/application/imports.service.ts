import { Injectable, NotFoundException } from "@nestjs/common";
import {
  assertImportRowsPresent,
  assertMappingHasFields,
  assertNoPendingHomologation,
  assertRequiredText,
  assertSupportedImportType,
} from "../../../common/domain-rules/shared-domain-rules";
import { ImportsRepository } from "../infrastructure/imports.repository";
import { ImportersService } from "./importers.service";
import { ImportQueueService } from "../infrastructure/import-queue.service";

@Injectable()
export class ImportsService {
  constructor(
    private readonly importsRepository: ImportsRepository,
    private readonly importersService: ImportersService,
    private readonly importQueueService: ImportQueueService,
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

  async uploadFile(id: string, sourceName: string, rows: Record<string, unknown>[]) {
    await this.ensureJob(id);

    assertRequiredText(sourceName, "el nombre de archivo");
    assertImportRowsPresent(rows);

    const updated = await this.importsRepository.updateJob(id, {
      sourceName,
      originals: rows,
      status: "mapping",
    });

    await this.importsRepository.appendAudit({
      entityId: id,
      action: "import.file.uploaded",
      origin: "imports.uploadFile",
      after: { rows: rows.length, sourceName },
    });
    return updated;
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
    const result = this.importersService.process(job.type, rows);

    const updated = await this.importsRepository.updateJob(id, {
      status: "ready_to_import",
      summary: result.summary,
      warnings: result.warnings,
    });

    await this.importsRepository.appendAudit({
      entityId: id,
      action: "import.prevalidated",
      origin: "imports.prevalidate",
      after: result.summary,
    });
    return { job: updated, warnings: result.warnings, summary: result.summary };
  }

  async preview(id: string) {
    const job = await this.ensureJob(id);

    assertSupportedImportType(this.importersService.isSupported(job.type), job.type);

    const rows = Array.isArray(job.originals) ? (job.originals as Record<string, unknown>[]) : [];
    const result = this.importersService.process(job.type, rows);
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
    const job = await this.ensureJob(id);
    const pendingHomologation = Number(job.summary?.pendingHomologation ?? 0);
    assertNoPendingHomologation(pendingHomologation);

    await this.importsRepository.updateJob(id, { status: "ready_to_import" });
    const queueResult = await this.importQueueService.enqueueImport(id);
    await this.importsRepository.appendAudit({
      entityId: id,
      action: "import.confirmed",
      origin: "imports.confirm",
      after: queueResult,
    });

    return {
      event: "import.finished",
      jobId: id,
      queued: queueResult.queued,
    };
  }

  private async ensureJob(id: string) {
    const job = await this.importsRepository.findById(id);
    if (!job) {
      throw new NotFoundException("ImportJob no encontrado");
    }
    return job;
  }
}

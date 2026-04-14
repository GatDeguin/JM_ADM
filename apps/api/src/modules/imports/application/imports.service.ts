import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
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
    if (!this.importersService.isSupported(type)) {
      throw new BadRequestException("Tipo de importación no soportado");
    }

    const job = await this.importsRepository.createJob(type, sourceName);
    await this.importsRepository.appendAudit(job.id, "import.job.created", { type, sourceName });
    return job;
  }

  async uploadFile(id: string, sourceName: string, rows: Record<string, unknown>[]) {
    await this.ensureJob(id);

    const updated = await this.importsRepository.updateJob(id, {
      sourceName,
      originals: rows,
      status: "mapping",
    });

    await this.importsRepository.appendAudit(id, "import.file.uploaded", { rows: rows.length, sourceName });
    return updated;
  }

  async defineMapping(id: string, mapping: Record<string, string>) {
    await this.ensureJob(id);

    const updated = await this.importsRepository.updateJob(id, {
      mapping,
      status: "validating",
    });

    await this.importsRepository.appendAudit(id, "import.mapping.defined", { mappingKeys: Object.keys(mapping).length });
    return updated;
  }

  async prevalidate(id: string) {
    const job = await this.ensureJob(id);

    if (!this.importersService.isSupported(job.type)) {
      throw new BadRequestException("Tipo de importación no soportado");
    }

    const rows = Array.isArray(job.originals) ? (job.originals as Record<string, unknown>[]) : [];
    const result = this.importersService.process(job.type, rows);

    const updated = await this.importsRepository.updateJob(id, {
      status: "ready_to_import",
      summary: result.summary,
      warnings: result.warnings,
    });

    await this.importsRepository.appendAudit(id, "import.prevalidated", result.summary);
    return { job: updated, warnings: result.warnings, summary: result.summary };
  }

  async preview(id: string) {
    const job = await this.ensureJob(id);

    if (!this.importersService.isSupported(job.type)) {
      throw new BadRequestException("Tipo de importación no soportado");
    }

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
    await this.ensureJob(id);
    await this.importsRepository.updateJob(id, { status: "ready_to_import" });
    const queueResult = await this.importQueueService.enqueueImport(id);
    await this.importsRepository.appendAudit(id, "import.confirmed", queueResult);

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

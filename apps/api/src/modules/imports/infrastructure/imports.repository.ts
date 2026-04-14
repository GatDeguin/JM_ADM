import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { AuditTrailService } from "../../audit/application/audit-trail.service";

@Injectable()
export class ImportsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditTrailService: AuditTrailService,
  ) {}

  createJob(type: string, sourceName: string) {
    return this.prisma.importJob.create({
      data: {
        type,
        sourceName,
        status: "uploaded",
        summary: {},
        warnings: [],
        originals: [],
      } as never,
    });
  }

  findById(id: string) {
    return this.prisma.importJob.findUnique({ where: { id } });
  }

  updateJob(id: string, data: Record<string, unknown>) {
    return this.prisma.importJob.update({ where: { id }, data: data as never });
  }

  async appendAudit(input: { entityId: string; action: string; origin: string; userId?: string; before?: unknown; after?: unknown }) {
    await this.auditTrailService.log({
      entity: "ImportBatch",
      entityId: input.entityId,
      action: input.action,
      origin: input.origin,
      userId: input.userId,
      before: input.before,
      after: input.after,
    });
  }

  async upsertCustomer(code: string, name: string, status: "active" | "pending_homologation") {
    await this.prisma.customer.upsert({
      where: { code },
      create: { code, name, status },
      update: { name, status },
    });
  }

  async upsertSupplier(code: string, name: string, status: "active" | "pending_homologation") {
    await this.prisma.supplier.upsert({
      where: { code },
      create: { code, name, status },
      update: { name, status },
    });
  }
}

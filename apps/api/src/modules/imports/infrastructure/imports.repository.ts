import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";

@Injectable()
export class ImportsRepository {
  constructor(private readonly prisma: PrismaService) {}

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

  async appendAudit(entityId: string, action: string, after?: unknown) {
    await this.prisma.auditLog.create({
      data: {
        entity: "ImportBatch",
        entityId,
        action,
        origin: "imports.module",
        after: after as never,
      },
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

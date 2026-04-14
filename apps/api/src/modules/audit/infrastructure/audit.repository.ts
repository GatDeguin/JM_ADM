import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionAuditLogInput, CreateAuditLogInput, AuditLogDto, UpdateAuditLogInput } from "../domain/audit.types";

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<AuditLogDto[]> { return this.prisma.auditLog.findMany({ orderBy: { id: "desc" } }) as Promise<AuditLogDto[]>; }
  get(id: string): Promise<AuditLogDto> { return this.prisma.auditLog.findUniqueOrThrow({ where: { id } }) as Promise<AuditLogDto>; }
  create(data: CreateAuditLogInput): Promise<AuditLogDto> { return this.prisma.auditLog.create({ data: data as any }) as Promise<AuditLogDto>; }
  update(id: string, data: UpdateAuditLogInput): Promise<AuditLogDto> { return this.prisma.auditLog.update({ where: { id }, data: data as any }) as Promise<AuditLogDto>; }
  remove(id: string) { return this.prisma.auditLog.delete({ where: { id } }); }

  runAction(id: string, payload: ActionAuditLogInput): Promise<AuditLogDto> {
    return this.prisma.auditLog.update({ where: { id }, data: { after: payload.after } }) as Promise<AuditLogDto>;
  }
}

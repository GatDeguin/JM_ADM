import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionQCRecordInput, CreateQCRecordInput, QCRecordDto, UpdateQCRecordInput } from "../domain/quality.types";

@Injectable()
export class QualityRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<QCRecordDto[]> { return this.prisma.qCRecord.findMany({ orderBy: { id: "desc" } }) as Promise<QCRecordDto[]>; }
  get(id: string): Promise<QCRecordDto> { return this.prisma.qCRecord.findUniqueOrThrow({ where: { id } }) as Promise<QCRecordDto>; }
  create(data: CreateQCRecordInput): Promise<QCRecordDto> { return this.prisma.qCRecord.create({ data: data as any }) as Promise<QCRecordDto>; }
  update(id: string, data: UpdateQCRecordInput): Promise<QCRecordDto> { return this.prisma.qCRecord.update({ where: { id }, data: data as any }) as Promise<QCRecordDto>; }
  remove(id: string) { return this.prisma.qCRecord.delete({ where: { id } }); }

  runAction(id: string, payload: ActionQCRecordInput): Promise<unknown> {
    return this.prisma.qCNonConformity.create({ data: { qcRecordId: id, severity: payload.severity, action: payload.action } });
  }
}

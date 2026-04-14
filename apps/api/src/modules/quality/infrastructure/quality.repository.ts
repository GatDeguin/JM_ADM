import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionQCRecordInput, CreateQCRecordInput, QCRecordDto, UpdateQCRecordInput } from "../domain/quality.types";

@Injectable()
export class QualityRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<QCRecordDto[]> {
    return this.prisma.qCRecord.findMany({ orderBy: { id: "desc" } }) as Promise<QCRecordDto[]>;
  }
  get(id: string): Promise<QCRecordDto> {
    return this.prisma.qCRecord.findUniqueOrThrow({ where: { id } }) as Promise<QCRecordDto>;
  }



  findBatch(batchId: string) {
    return this.prisma.batch.findUnique({ where: { id: batchId }, select: { id: true, status: true } });
  }
  findBatchFamily(batchId: string) {
    return this.prisma.batch
      .findUnique({
        where: { id: batchId },
        select: {
          productionOrder: { select: { productBase: { select: { family: { select: { id: true, name: true } } } } } },
        },
      })
      .then((result: any) => result?.productionOrder?.productBase?.family ?? null);
  }

  listChecklistByFamily(familyId: string, familyName: string) {
    return this.prisma.qCChecklist.findMany({
      where: {
        active: true,
        OR: [
          { name: { startsWith: `${familyId}::` } },
          { name: { startsWith: `${familyName}::` } },
        ],
      },
      orderBy: { name: "asc" },
    });
  }

  createWithChecklist(data: CreateQCRecordInput): Promise<QCRecordDto> {
    const statusByDecision: Record<string, "released" | "retained" | "in_process"> = {
      approved: "released",
      rejected: "retained",
      reprocess: "in_process",
    };

    return this.prisma.$transaction(async (tx: any) => {
      const qc = await tx.qCRecord.create({
        data: {
          batchId: data.batchId,
          decision: data.decision,
          notes: data.notes,
        },
      });

      await tx.qCRecordItem.createMany({
        data: data.checklistItems.map((item) => ({
          qcRecordId: qc.id,
          checklistItem: item.checklistItem,
          passed: item.passed,
          note: item.note,
        })),
      });

      await tx.batch.update({ where: { id: data.batchId }, data: { status: statusByDecision[data.decision] ?? "retained" } });

      return qc as QCRecordDto;
    });
  }

  update(id: string, data: UpdateQCRecordInput): Promise<QCRecordDto> {
    return this.prisma.qCRecord.update({ where: { id }, data: data as any }) as Promise<QCRecordDto>;
  }
  remove(id: string) {
    return this.prisma.qCRecord.delete({ where: { id } });
  }

  runAction(id: string, payload: ActionQCRecordInput): Promise<unknown> {
    return this.prisma.qCNonConformity.create({ data: { qcRecordId: id, severity: payload.severity, action: payload.action } });
  }
}

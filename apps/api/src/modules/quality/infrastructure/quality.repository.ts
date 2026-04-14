import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionQCRecordInput, CreateQCRecordInput, QCProcess, QCRecordDto, UpdateQCRecordInput } from "../domain/quality.types";

type ChecklistContext = { familyId?: string | null; familyName?: string | null; skuId?: string | null; process: QCProcess | string };

type ParsedChecklist = {
  rawName: string;
  item: string;
  family: string | null;
  sku: string | null;
  process: string | null;
};

function parseChecklistName(name: string): ParsedChecklist {
  const normalized = name.trim();
  const metadataRegex = /^FAMILY=(.*?);SKU=(.*?);PROCESS=(.*?);ITEM=(.+)$/i;
  const metadata = normalized.match(metadataRegex);
  if (metadata) {
    return {
      rawName: normalized,
      family: metadata[1] && metadata[1] !== "*" ? metadata[1] : null,
      sku: metadata[2] && metadata[2] !== "*" ? metadata[2] : null,
      process: metadata[3] && metadata[3] !== "*" ? metadata[3].toLowerCase() : null,
      item: metadata[4].trim(),
    };
  }

  const legacy = normalized.split("::");
  if (legacy.length >= 2) {
    return {
      rawName: normalized,
      family: legacy[0].trim() || null,
      sku: null,
      process: "production",
      item: legacy.slice(1).join("::").trim(),
    };
  }

  return { rawName: normalized, family: null, sku: null, process: "production", item: normalized };
}

function matchesChecklist(context: ChecklistContext, checklist: ParsedChecklist): boolean {
  const processMatches = !checklist.process || checklist.process === context.process.toLowerCase();
  const familyMatches =
    !checklist.family ||
    checklist.family === context.familyId ||
    (context.familyName ? checklist.family.toLowerCase() === context.familyName.toLowerCase() : false);
  const skuMatches = !checklist.sku || checklist.sku === context.skuId;
  return processMatches && familyMatches && skuMatches;
}

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

  findBatchQualityContext(batchId: string) {
    return this.prisma.batch
      .findUnique({
        where: { id: batchId },
        select: {
          productionOrder: { select: { productBase: { select: { family: { select: { id: true, name: true } } } } } },
        },
      })
      .then((result: any) => {
        const family = result?.productionOrder?.productBase?.family;
        return family ? { familyId: family.id as string, familyName: family.name as string } : null;
      });
  }

  async listChecklistByContext(context: ChecklistContext) {
    const checklists = await this.prisma.qCChecklist.findMany({ where: { active: true }, orderBy: { name: "asc" } as any });
    return checklists
      .map((checklist: any) => ({ ...checklist, parsed: parseChecklistName(checklist.name) }))
      .filter((checklist: any) => matchesChecklist(context, checklist.parsed))
      .map((checklist: any) => ({
        id: checklist.id,
        item: checklist.parsed.item,
        process: checklist.parsed.process ?? context.process,
        family: checklist.parsed.family,
        sku: checklist.parsed.sku,
        name: checklist.name,
      }));
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
    const actionToStatus: Record<string, "retained" | "in_process"> = {
      retener: "retained",
      rechazar: "retained",
      reprocesar: "in_process",
    };

    return this.prisma.$transaction(async (tx: any) => {
      const qcRecord = await tx.qCRecord.findUniqueOrThrow({ where: { id }, select: { id: true, batchId: true } });
      const nonConformity = await tx.qCNonConformity.create({
        data: { qcRecordId: id, severity: payload.severity, action: payload.action },
      });

      const nextStatus = actionToStatus[payload.action];
      if (nextStatus) {
        await tx.batch.update({ where: { id: qcRecord.batchId }, data: { status: nextStatus } });
      }

      return nonConformity;
    });
  }
}

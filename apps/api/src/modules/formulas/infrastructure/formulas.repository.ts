import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";

type FormulaVersionPayload = {
  warning?: string | null;
  components: Array<{ itemId: string; qty: number; unitId: string }>;
  steps: Array<{ stepNo: number; instruction: string }>;
};

@Injectable()
export class FormulasRepository {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.formulaTemplate.findMany({ orderBy: { name: "asc" } });
  }

  findById(id: string) {
    return this.prisma.formulaTemplate.findUnique({
      where: { id },
      include: {
        FormulaVersion: {
          include: { FormulaComponent: true, FormulaStep: true, FormulaApproval: true },
          orderBy: { version: "desc" },
        },
      },
    });
  }

  findVersionById(id: string) {
    return this.prisma.formulaVersion.findUnique({
      where: { id },
      include: {
        template: true,
        FormulaComponent: { orderBy: { itemId: "asc" } },
        FormulaStep: { orderBy: { stepNo: "asc" } },
      },
    });
  }

  findLatestVersion(templateId: string) {
    return this.prisma.formulaVersion.findFirst({ where: { templateId }, orderBy: { version: "desc" } });
  }

  findUnits(unitIds: string[]) {
    return this.prisma.unit.findMany({ where: { id: { in: unitIds } }, select: { id: true, status: true } });
  }

  create(code: string, name: string) {
    return this.prisma.formulaTemplate.create({ data: { code, name, status: "draft" } });
  }

  approve(id: string) {
    return this.prisma.formulaTemplate.update({ where: { id }, data: { status: "approved" } });
  }

  async createVersion(templateId: string, payload: FormulaVersionPayload) {
    return this.prisma.$transaction(async (tx: any) => {
      const latest = await tx.formulaVersion.findFirst({ where: { templateId }, orderBy: { version: "desc" } });
      const versionNumber = (latest?.version ?? 0) + 1;
      const version = await tx.formulaVersion.create({
        data: {
          templateId,
          version: versionNumber,
          status: "draft",
          warning: payload.warning ?? null,
        },
      });

      if (payload.components.length) {
        await tx.formulaComponent.createMany({
          data: payload.components.map((component) => ({
            formulaVersionId: version.id,
            itemId: component.itemId,
            qty: component.qty,
            unitId: component.unitId,
          })),
        });
      }

      if (payload.steps.length) {
        await tx.formulaStep.createMany({
          data: payload.steps.map((step) => ({
            formulaVersionId: version.id,
            stepNo: step.stepNo,
            instruction: step.instruction,
          })),
        });
      }

      return tx.formulaVersion.findUniqueOrThrow({
        where: { id: version.id },
        include: {
          FormulaComponent: { orderBy: { itemId: "asc" } },
          FormulaStep: { orderBy: { stepNo: "asc" } },
        },
      });
    });
  }

  async approveVersion(templateId: string, versionId: string, approvedBy: string) {
    return this.prisma.$transaction(async (tx: any) => {
      await tx.formulaVersion.updateMany({ where: { templateId, status: "approved" }, data: { status: "obsolete" } });
      const approved = await tx.formulaVersion.update({ where: { id: versionId }, data: { status: "approved" } });
      await tx.formulaApproval.create({ data: { formulaVersionId: versionId, approvedBy } });

      const template = await tx.formulaTemplate.findUniqueOrThrow({ where: { id: templateId } });
      if (template.familyId) {
        const productBases = await tx.productBase.findMany({ where: { familyId: template.familyId }, select: { id: true } });
        for (const productBase of productBases) {
          await tx.productBase.update({ where: { id: productBase.id }, data: { activeFormulaVersionId: versionId } });
        }
      }

      await tx.formulaTemplate.update({ where: { id: templateId }, data: { status: "approved" } });
      return approved;
    });
  }

  obsoleteVersion(versionId: string) {
    return this.prisma.formulaVersion.update({ where: { id: versionId }, data: { status: "obsolete" } });
  }

  async compareVersions(leftId: string, rightId: string) {
    const [left, right] = await Promise.all([this.findVersionById(leftId), this.findVersionById(rightId)]);
    return { left, right };
  }

  findProductBaseById(productBaseId: string) {
    return this.prisma.productBase.findUnique({
      where: { id: productBaseId },
      select: { id: true, activeFormulaVersionId: true },
    });
  }
}

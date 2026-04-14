import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";

@Injectable()
export class ReportingRepository {
  constructor(private readonly prisma: PrismaService) {}

  countOpenProductionBatches() {
    return this.prisma.batch.count({ where: { status: { not: "closed" } } });
  }

  countPendingAliases() {
    return this.prisma.entityAlias.count({ where: { canonicalId: null } });
  }

  countSkusWithoutPrice() {
    return this.prisma.sKU.count({ where: { status: "active" } });
  }

  countFormulaWarnings() {
    return this.prisma.formulaVersion.count({ where: { warning: { not: null } } });
  }
}

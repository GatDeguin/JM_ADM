import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";

@Injectable()
export class ProductionRepository {
  constructor(private readonly prisma: PrismaService) {}

  listOrders() {
    return this.prisma.productionOrder.findMany({ orderBy: { code: "desc" } });
  }

  createOrder(code: string, productBaseId: string, formulaVersionId: string, plannedQty: number) {
    return this.prisma.productionOrder.create({
      data: {
        code,
        productBaseId,
        formulaVersionId,
        plannedQty,
        status: "planned",
      },
    });
  }

  findOrder(id: string) {
    return this.prisma.productionOrder.findUnique({ where: { id } });
  }

  closeBatch(id: string, responsibleUserId: string) {
    return this.prisma.batch.update({ where: { id }, data: { responsibleUserId, status: "closed" } });
  }
}

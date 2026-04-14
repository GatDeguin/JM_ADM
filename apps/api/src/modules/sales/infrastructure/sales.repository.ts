import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";

@Injectable()
export class SalesRepository {
  constructor(private readonly prisma: PrismaService) {}

  listOrders() {
    return this.prisma.salesOrder.findMany({ orderBy: { code: "desc" } });
  }

  createOrder(code: string, customerId: string, priceListId: string, total: number) {
    return this.prisma.salesOrder.create({
      data: {
        code,
        customerId,
        priceListId,
        total,
        status: "confirmed",
      },
    });
  }
}

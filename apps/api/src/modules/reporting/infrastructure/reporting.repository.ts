import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";

type ReportFilters = {
  startDate?: Date;
  endDate?: Date;
  channel?: string;
  line?: string;
  customerId?: string;
};

@Injectable()
export class ReportingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async productionReport(filters: ReportFilters) {
    const where: any = {
      ...(filters.line
        ? { productionOrder: { productBase: { line: { name: { contains: filters.line, mode: "insensitive" } } } } }
        : {}),
    };

    const [total, open, closed, retained] = await Promise.all([
      this.prisma.batch.count({ where }),
      this.prisma.batch.count({ where: { ...where, status: { in: ["planned", "in_process"] } } }),
      this.prisma.batch.count({ where: { ...where, status: "closed" } }),
      this.prisma.batch.count({ where: { ...where, status: "retained" } }),
    ]);

    return { total, open, closed, retained };
  }

  async stockReport(_filters: ReportFilters) {
    const balances = await this.prisma.stockBalance.findMany({ select: { qty: true, reservedQty: true } });
    const totalQty = balances.reduce((acc: number, row: { qty: unknown }) => acc + Number(row.qty), 0);
    const reservedQty = balances.reduce((acc: number, row: { reservedQty: unknown }) => acc + Number(row.reservedQty), 0);

    return {
      skusInStock: balances.length,
      totalQty,
      reservedQty,
      availableQty: totalQty - reservedQty,
    };
  }

  async salesReport(filters: ReportFilters) {
    const where: any = {
      ...(filters.customerId ? { customerId: filters.customerId } : {}),
      ...(filters.channel ? { priceList: { code: { contains: filters.channel, mode: "insensitive" } } } : {}),
      ...(filters.line ? { SalesOrderItem: { some: { sku: { productBase: { line: { name: { contains: filters.line, mode: "insensitive" } } } } } } } : {}),
    };

    const orders = await this.prisma.salesOrder.findMany({ where, select: { total: true, status: true } });
    const billed = orders.reduce((acc: number, order: { total: unknown }) => acc + Number(order.total), 0);

    return {
      orders: orders.length,
      billed,
      confirmed: orders.filter((order: { status: string }) => order.status === "confirmed").length,
      cancelled: orders.filter((order: { status: string }) => order.status === "cancelled").length,
    };
  }

  async financeReport(filters: ReportFilters) {
    const range = this.buildDateRange(filters);

    const [receipts, payments, expenses] = await Promise.all([
      this.prisma.receipt.aggregate({
        where: {
          ...(range ? { createdAt: range } : {}),
          ...(filters.customerId ? { customerId: filters.customerId } : {}),
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({ where: range ? { createdAt: range } : {}, _sum: { amount: true } }),
      this.prisma.expense.aggregate({ where: range ? { date: range } : {}, _sum: { amount: true } }),
    ]);

    const incoming = Number(receipts._sum.amount ?? 0);
    const outgoing = Number(payments._sum.amount ?? 0) + Number(expenses._sum.amount ?? 0);

    return {
      incoming,
      outgoing,
      netCashflow: incoming - outgoing,
    };
  }

  async marginReport(filters: ReportFilters) {
    const sales = await this.salesReport(filters);
    const expenses = await this.prisma.expense.aggregate({
      where: this.buildDateRange(filters) ? { date: this.buildDateRange(filters) } : {},
      _sum: { amount: true },
    });
    const expenseValue = Number(expenses._sum.amount ?? 0);
    const grossMarginValue = sales.billed - expenseValue;

    return {
      sales: sales.billed,
      costs: expenseValue,
      grossMarginValue,
      grossMarginPct: sales.billed > 0 ? Number(((grossMarginValue / sales.billed) * 100).toFixed(2)) : 0,
    };
  }

  async qualityReport(filters: ReportFilters) {
    const range = this.buildDateRange(filters);

    const [qcRecords, retainedBatches] = await Promise.all([
      this.prisma.qCRecord.count({ where: range ? { createdAt: range } : {} }),
      this.prisma.batch.count({ where: { status: "retained" } }),
    ]);

    return {
      qcRecords,
      retainedBatches,
    };
  }

  countPendingAliases() {
    return this.prisma.entityAlias.count({ where: { canonicalId: null } });
  }

  countDuplicateAliases() {
    return this.prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM (
        SELECT alias
        FROM "EntityAlias"
        GROUP BY alias
        HAVING COUNT(*) > 1
      ) duplicates
    `;
  }

  countSkusWithoutPrice() {
    return this.prisma.sKU.count({ where: { status: "active", PriceListItem: { none: {} } } });
  }

  countFormulaWarnings() {
    return this.prisma.formulaVersion.count({ where: { warning: { not: null } } });
  }

  countItemsWithoutCost() {
    return this.prisma.item.count({ where: { PurchaseOrderItem: { none: {} } } });
  }

  async dataQualityLists() {
    const [pendingAliases, duplicateAliases, skusWithoutPrice, formulasWithWarning, itemsWithoutCost, retainedLots] = await Promise.all([
      this.prisma.entityAlias.findMany({ where: { canonicalId: null }, take: 50, orderBy: { alias: "asc" } }),
      this.prisma.$queryRaw<Array<{ alias: string; occurrences: bigint }>>`
        SELECT alias, COUNT(*)::bigint AS occurrences
        FROM "EntityAlias"
        GROUP BY alias
        HAVING COUNT(*) > 1
        ORDER BY alias ASC
        LIMIT 50
      `,
      this.prisma.sKU.findMany({ where: { status: "active", PriceListItem: { none: {} } }, take: 50, orderBy: { code: "asc" } }),
      this.prisma.formulaVersion.findMany({ where: { warning: { not: null } }, take: 50, orderBy: { version: "desc" } }),
      this.prisma.item.findMany({ where: { PurchaseOrderItem: { none: {} } }, take: 50, orderBy: { code: "asc" } }),
      this.prisma.batch.findMany({ where: { status: "retained" }, take: 50, orderBy: { code: "asc" } }),
    ]);

    return {
      pendingAliases,
      duplicateAliases: duplicateAliases.map((row: { alias: string; occurrences: bigint }) => ({ ...row, occurrences: Number(row.occurrences) })),
      skusWithoutPrice,
      formulasWithWarning,
      itemsWithoutCost,
      retainedLots,
    };
  }

  createCostSnapshot(period: string, payload: Record<string, unknown>) {
    return this.prisma.costSnapshot.create({ data: { key: period, payload, date: new Date(`${period}-01T00:00:00.000Z`) } });
  }

  createMarginSnapshot(period: string, payload: Record<string, unknown>) {
    return this.prisma.marginSnapshot.create({ data: { key: period, payload, date: new Date(`${period}-01T00:00:00.000Z`) } });
  }

  upsertMonthlyClose(period: string) {
    return this.prisma.monthlyClose.upsert({
      where: { month: period },
      create: { month: period, status: "closed", closedAt: new Date() },
      update: { status: "closed", closedAt: new Date() },
    });
  }

  private buildDateRange(filters: ReportFilters): { gte?: Date; lte?: Date } | undefined {
    if (!filters.startDate && !filters.endDate) return undefined;
    return {
      ...(filters.startDate ? { gte: filters.startDate } : {}),
      ...(filters.endDate ? { lte: filters.endDate } : {}),
    };
  }
}

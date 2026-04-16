import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { AuditTrailService } from "../../audit/application/audit-trail.service";

type ApplicatorType =
  | "formulas"
  | "production_journals"
  | "customers"
  | "suppliers"
  | "price_lists"
  | "historical_sales"
  | "expenses"
  | "opening_stock";

type ApplicatorResultState = "created" | "updated" | "skipped";

export type ApplyRecordInput = {
  type: ApplicatorType;
  key: string;
  canonicalValue: Record<string, unknown>;
  originalValue: Record<string, unknown>;
  pendingHomologation: boolean;
};

export type ApplyRecordResult = {
  entity: string;
  state: ApplicatorResultState;
  warnings: string[];
};

@Injectable()
export class ImportsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditTrailService: AuditTrailService,
  ) {}

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

  async appendAudit(input: { entityId: string; action: string; origin: string; userId?: string; before?: unknown; after?: unknown }) {
    await this.auditTrailService.log({
      entity: "ImportBatch",
      entityId: input.entityId,
      action: input.action,
      origin: input.origin,
      userId: input.userId,
      before: input.before,
      after: input.after,
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

  async applyRecord(input: ApplyRecordInput): Promise<ApplyRecordResult> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      switch (input.type) {
        case "customers":
          return this.applyCustomer(tx, input);
        case "suppliers":
          return this.applySupplier(tx, input);
        case "formulas":
          return this.applyFormula(tx, input);
        case "production_journals":
          return this.applyProductionJournal(tx, input);
        case "price_lists":
          return this.applyPriceList(tx, input);
        case "historical_sales":
          return this.applyHistoricalSale(tx, input);
        case "expenses":
          return this.applyExpense(tx, input);
        case "opening_stock":
          return this.applyOpeningStock(tx, input);
        default:
          return { entity: "Unknown", state: "skipped" as const, warnings: ["Tipo no soportado por applicator"] };
      }
    });
  }

  private async applyCustomer(tx: Prisma.TransactionClient, input: ApplyRecordInput): Promise<ApplyRecordResult> {
    const code = String(input.canonicalValue.code ?? input.key);
    const name = String(input.canonicalValue.name ?? input.originalValue.name ?? code);
    const status = input.pendingHomologation ? "pending_homologation" : "active";
    const existing = await tx.customer.findUnique({ where: { code } });

    if (existing) {
      await tx.customer.update({ where: { code }, data: { name, status } });
      return { entity: "Customer", state: "updated", warnings: [] };
    }

    await tx.customer.create({ data: { code, name, status } });
    return { entity: "Customer", state: "created", warnings: [] };
  }

  private async applySupplier(tx: Prisma.TransactionClient, input: ApplyRecordInput): Promise<ApplyRecordResult> {
    const code = String(input.canonicalValue.code ?? input.key);
    const name = String(input.canonicalValue.name ?? input.originalValue.name ?? code);
    const status = input.pendingHomologation ? "pending_homologation" : "active";
    const existing = await tx.supplier.findUnique({ where: { code } });

    if (existing) {
      await tx.supplier.update({ where: { code }, data: { name, status } });
      return { entity: "Supplier", state: "updated", warnings: [] };
    }

    await tx.supplier.create({ data: { code, name, status } });
    return { entity: "Supplier", state: "created", warnings: [] };
  }

  private async applyFormula(tx: Prisma.TransactionClient, input: ApplyRecordInput): Promise<ApplyRecordResult> {
    const code = String(input.canonicalValue.code ?? input.key);
    const name = String(input.canonicalValue.name ?? input.originalValue.name ?? code);
    const existing = await tx.formulaTemplate.findUnique({ where: { code } });

    if (existing) {
      await tx.formulaTemplate.update({ where: { code }, data: { name } });
      return { entity: "FormulaTemplate", state: "updated", warnings: [] };
    }

    await tx.formulaTemplate.create({ data: { code, name, status: "draft" } });
    return { entity: "FormulaTemplate", state: "created", warnings: [] };
  }

  private async applyProductionJournal(tx: Prisma.TransactionClient, input: ApplyRecordInput): Promise<ApplyRecordResult> {
    const code = String(input.canonicalValue.batch ?? input.key);
    const existing = await tx.batch.findUnique({ where: { code } });

    if (existing) {
      return { entity: "Batch", state: "skipped", warnings: ["Lote ya existente, se mantiene idempotencia por llave canónica"] };
    }

    await tx.batch.create({
      data: {
        code,
        status: "in_process",
      },
    });
    return { entity: "Batch", state: "created", warnings: [] };
  }

  private async applyPriceList(tx: Prisma.TransactionClient, input: ApplyRecordInput): Promise<ApplyRecordResult> {
    const code = String(input.canonicalValue.code ?? "default");
    const skuCode = String(input.canonicalValue.sku ?? "");
    const rawPrice = Number(input.canonicalValue.price ?? 0);
    const price = Number.isFinite(rawPrice) ? rawPrice : 0;

    const list = await tx.priceList.upsert({
      where: { code },
      create: {
        code,
        name: String(input.originalValue.name ?? code),
        startsAt: new Date(),
        status: "active",
      },
      update: {
        name: String(input.originalValue.name ?? code),
      },
    });

    const sku = await tx.sKU.findUnique({ where: { code: skuCode } });
    if (!sku) {
      await this.registerPendingAlias(tx, "sku", skuCode, input.originalValue.sku ?? skuCode);
      return {
        entity: "PriceListItem",
        state: "skipped",
        warnings: [`SKU no encontrado (${skuCode}), registrado como pending_homologation`],
      };
    }

    const existing = await tx.priceListItem.findUnique({ where: { priceListId_skuId: { priceListId: list.id, skuId: sku.id } } });
    if (existing) {
      await tx.priceListItem.update({
        where: { priceListId_skuId: { priceListId: list.id, skuId: sku.id } },
        data: { price },
      });
      return { entity: "PriceListItem", state: "updated", warnings: [] };
    }

    await tx.priceListItem.create({
      data: {
        priceListId: list.id,
        skuId: sku.id,
        price,
      },
    });
    return { entity: "PriceListItem", state: "created", warnings: [] };
  }

  private async applyHistoricalSale(tx: Prisma.TransactionClient, input: ApplyRecordInput): Promise<ApplyRecordResult> {
    const customerCode = String(input.canonicalValue.customer ?? "");
    const skuCode = String(input.canonicalValue.sku ?? "");
    const qty = Number(input.canonicalValue.qty ?? 0);
    const date = new Date(String(input.canonicalValue.date ?? new Date().toISOString()));
    const orderCode = `IMP-${String(input.key).slice(0, 24)}`;

    const customer = await tx.customer.findUnique({ where: { code: customerCode } });
    const sku = await tx.sKU.findUnique({ where: { code: skuCode } });
    const defaultPriceList = await tx.priceList.findFirst({ orderBy: { startsAt: "desc" } });

    if (!customer) {
      await this.registerPendingAlias(tx, "customer", customerCode, input.originalValue.customer ?? customerCode);
    }
    if (!sku) {
      await this.registerPendingAlias(tx, "sku", skuCode, input.originalValue.sku ?? skuCode);
    }
    if (!customer || !sku || !defaultPriceList) {
      return {
        entity: "SalesOrder",
        state: "skipped",
        warnings: ["Venta histórica omitida por referencias faltantes (customer/sku/price_list)"],
      };
    }

    const existing = await tx.salesOrder.findUnique({ where: { code: orderCode } });
    if (existing) {
      return { entity: "SalesOrder", state: "skipped", warnings: ["Venta histórica ya importada (idempotencia)"] };
    }

    await tx.salesOrder.create({
      data: {
        code: orderCode,
        customerId: customer.id,
        priceListId: defaultPriceList.id,
        status: "closed",
        total: qty,
      },
    });

    await tx.costSnapshot.create({
      data: {
        key: `historical_sale:${orderCode}`,
        date,
        payload: { qty, skuCode, importedAt: new Date().toISOString() },
      },
    });
    return { entity: "SalesOrder", state: "created", warnings: [] };
  }

  private async applyExpense(tx: Prisma.TransactionClient, input: ApplyRecordInput): Promise<ApplyRecordResult> {
    const categoryName = String(input.canonicalValue.category ?? "general");
    const supplierCode = String(input.canonicalValue.supplier ?? "");
    const amount = Number(input.canonicalValue.amount ?? 0);
    const date = new Date(String(input.canonicalValue.date ?? new Date().toISOString()));

    const category = await tx.expenseCategory.upsert({
      where: { id: `imp-${categoryName}` },
      create: { id: `imp-${categoryName}`, name: categoryName },
      update: { name: categoryName },
    });
    const supplier = supplierCode ? await tx.supplier.findUnique({ where: { code: supplierCode } }) : null;
    if (supplierCode && !supplier) {
      await this.registerPendingAlias(tx, "supplier", supplierCode, input.originalValue.supplier ?? supplierCode);
    }

    await tx.expense.create({
      data: {
        date,
        categoryId: category.id,
        supplierId: supplier?.id,
        amount,
        status: "open",
      },
    });
    return { entity: "Expense", state: "created", warnings: supplierCode && !supplier ? ["Proveedor pendiente de homologación"] : [] };
  }

  private async applyOpeningStock(tx: Prisma.TransactionClient, input: ApplyRecordInput): Promise<ApplyRecordResult> {
    const itemCode = String(input.canonicalValue.item ?? "");
    const warehouseName = String(input.canonicalValue.warehouse ?? "");
    const qty = Number(input.canonicalValue.qty ?? 0);
    const itemName = String(input.originalValue.item_name ?? itemCode);

    const item = await tx.item.upsert({
      where: { code: itemCode },
      create: {
        code: itemCode,
        name: itemName,
        status: input.pendingHomologation ? "pending_homologation" : "active",
      },
      update: {},
    });
    const warehouse = await tx.warehouse.upsert({
      where: { id: `imp-wh-${warehouseName}` },
      create: { id: `imp-wh-${warehouseName}`, name: warehouseName, status: "active" },
      update: { name: warehouseName },
    });

    const existing = await tx.stockBalance.findFirst({
      where: { itemId: item.id, warehouseId: warehouse.id, locationId: null },
    });
    if (existing) {
      await tx.stockBalance.update({
        where: { id: existing.id },
        data: { qty },
      });
      return { entity: "StockBalance", state: "updated", warnings: [] };
    }

    await tx.stockBalance.create({
      data: {
        itemId: item.id,
        warehouseId: warehouse.id,
        locationId: null,
        qty,
      },
    });
    return { entity: "StockBalance", state: "created", warnings: [] };
  }

  private async registerPendingAlias(
    tx: Prisma.TransactionClient,
    entityType: string,
    alias: string,
    originalValue: unknown,
  ) {
    if (!alias) {
      return;
    }

    await tx.entityAlias.upsert({
      where: { entityType_alias: { entityType, alias } },
      create: {
        entityType,
        alias,
        status: "pending_homologation",
        originalValue: String(originalValue ?? alias),
      },
      update: {
        status: "pending_homologation",
        originalValue: String(originalValue ?? alias),
      },
    });
  }
}

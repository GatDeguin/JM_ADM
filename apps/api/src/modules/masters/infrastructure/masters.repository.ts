import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionUnitInput, ContextualEntityType, ContextualOptionDto, CreateContextualEntityInput, CreateUnitInput, UnitDto, UpdateUnitInput } from "../domain/masters.types";
import { AuditTrailService } from "../../audit/application/audit-trail.service";

const noopAuditTrail = {
  logCreate: async () => undefined,
  logUpdate: async () => undefined,
  logHomologation: async () => undefined,
};

@Injectable()
export class MastersRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditTrailService: Pick<AuditTrailService, "logCreate" | "logUpdate" | "logHomologation"> = noopAuditTrail,
  ) {}

  list(): Promise<UnitDto[]> { return this.prisma.unit.findMany({ orderBy: { id: "desc" } }) as Promise<UnitDto[]>; }
  get(id: string): Promise<UnitDto> { return this.prisma.unit.findUniqueOrThrow({ where: { id } }) as Promise<UnitDto>; }
  async create(data: CreateUnitInput): Promise<UnitDto> {
    const created = await this.prisma.unit.create({ data: data as any }) as UnitDto;
    await this.auditTrailService.logCreate({ entity: "Unit", entityId: created.id, origin: "masters.create", after: created });
    return created;
  }
  async update(id: string, data: UpdateUnitInput): Promise<UnitDto> {
    const previous = await this.prisma.unit.findUniqueOrThrow({ where: { id } });
    const updated = await this.prisma.unit.update({ where: { id }, data: data as any }) as UnitDto;
    await this.auditTrailService.logUpdate({ entity: "Unit", entityId: id, origin: "masters.update", before: previous, after: updated });
    return updated;
  }
  remove(id: string) { return this.prisma.unit.delete({ where: { id } }); }

  async runAction(id: string, payload: ActionUnitInput): Promise<UnitDto> {
    void payload;
    const previous = await this.prisma.unit.findUniqueOrThrow({ where: { id } });
    const updated = await this.prisma.unit.update({ where: { id }, data: { status: "inactive" } }) as UnitDto;
    await this.auditTrailService.logHomologation({ entity: "Unit", entityId: id, origin: "masters.runAction", before: previous, after: updated });
    return updated;
  }

  async listContextualOptions(entityType: ContextualEntityType): Promise<ContextualOptionDto[]> {
    if (entityType === "producto") {
      const rows = await this.prisma.productBase.findMany({ take: 50, orderBy: { id: "desc" }, include: { variant: true } });
      return rows.map((row: any) => ({ id: row.id, label: row.name, meta: row.code || row.variant?.name }));
    }
    if (entityType === "variante") {
      const rows = await this.prisma.variant.findMany({ take: 50, orderBy: { id: "desc" } });
      return rows.map((row: any) => ({ id: row.id, label: row.name }));
    }
    if (entityType === "presentacion") {
      const rows = await this.prisma.presentation.findMany({ take: 50, orderBy: { id: "desc" }, include: { unit: true } });
      return rows.map((row: any) => ({ id: row.id, label: row.name, meta: row.unit?.name ?? "Sin unidad" }));
    }
    if (entityType === "unidad") {
      const rows = await this.prisma.unit.findMany({ take: 50, orderBy: { id: "desc" } });
      return rows.map((row: any) => ({ id: row.id, label: row.name, meta: row.code }));
    }
    if (entityType === "sku") {
      const rows = await this.prisma.sKU.findMany({ take: 50, orderBy: { id: "desc" }, include: { productBase: true, presentation: true } });
      return rows.map((row: any) => ({ id: row.id, label: row.code, meta: `${row.productBase.name} · ${row.presentation.name}` }));
    }
    if (entityType === "alias") {
      const rows = await this.prisma.entityAlias.findMany({ take: 50, orderBy: { id: "desc" } });
      return rows.map((row: any) => ({ id: row.id, label: row.alias, meta: row.entityType }));
    }
    if (entityType === "proveedor") {
      const rows = await this.prisma.supplier.findMany({ take: 50, orderBy: { id: "desc" } });
      return rows.map((row: any) => ({ id: row.id, label: row.name, meta: row.code }));
    }
    if (entityType === "cliente") {
      const rows = await this.prisma.customer.findMany({ take: 50, orderBy: { id: "desc" } });
      return rows.map((row: any) => ({ id: row.id, label: row.name, meta: row.code }));
    }
    if (entityType === "direccion") {
      const rows = await this.prisma.customerAddress.findMany({ take: 50, orderBy: { id: "desc" }, include: { customer: true } });
      return rows.map((row: any) => ({ id: row.id, label: row.label, meta: `${row.customer.name} · ${row.city}` }));
    }
    if (entityType === "lista") {
      const rows = await this.prisma.priceList.findMany({ take: 50, orderBy: { id: "desc" } });
      return rows.map((row: any) => ({ id: row.id, label: row.name, meta: row.code }));
    }
    if (entityType === "cuenta") {
      const rows = await this.prisma.cashAccount.findMany({ take: 50, orderBy: { id: "desc" } });
      return rows.map((row: any) => ({ id: row.id, label: row.name, meta: row.type }));
    }
    if (entityType === "cuenta_cobrar") {
      const rows = await this.prisma.accountsReceivable.findMany({ take: 50, orderBy: { id: "desc" }, include: { customer: true } });
      return rows.map((row: any) => ({ id: row.id, label: `CxC ${row.id.slice(-6)}`, meta: `${row.customer.name} · ${row.balance}` }));
    }
    if (entityType === "formula_version") {
      const rows = await this.prisma.formulaVersion.findMany({ take: 50, orderBy: { id: "desc" }, include: { template: true } });
      return rows.map((row: any) => ({ id: row.id, label: `${row.template.code} v${row.version}`, meta: row.status }));
    }

    const rows = await this.prisma.accountsPayable.findMany({ take: 50, orderBy: { id: "desc" }, include: { supplier: true } });
    return rows.map((row: any) => ({ id: row.id, label: `CxP ${row.id.slice(-6)}`, meta: `${row.supplier.name} · ${row.balance}` }));
  }

  async createContextualEntity(entityType: ContextualEntityType, data: CreateContextualEntityInput): Promise<ContextualOptionDto> {
    const code = `CTX-${Date.now()}`;
    const ctx = data.context ?? {};

    if (entityType === "producto") {
      const created = await this.prisma.productBase.create({ data: { code: `PB-${Date.now()}`, name: data.label } });
      return { id: created.id, label: created.name, meta: created.code };
    }
    if (entityType === "variante") {
      const created = await this.prisma.variant.create({ data: { name: data.label } });
      return { id: created.id, label: created.name };
    }
    if (entityType === "presentacion") {
      const unitId = String(ctx.unitId ?? "").trim();
      const unitLabel = String(ctx.unitLabel ?? "").trim();
      let resolvedUnitId = unitId;
      if (!resolvedUnitId && unitLabel) {
        const unit = await this.prisma.unit.create({ data: { code: `UNIT-${Date.now()}`, name: unitLabel } });
        resolvedUnitId = unit.id;
      }
      const created = await this.prisma.presentation.create({ data: { name: data.label, unitId: resolvedUnitId || null } });
      return { id: created.id, label: created.name };
    }
    if (entityType === "unidad") {
      const created = await this.prisma.unit.create({ data: { name: data.label, code } });
      return { id: created.id, label: created.name, meta: created.code };
    }
    if (entityType === "sku") {
      const productBaseId = String(ctx.productBaseId ?? "").trim();
      const productBaseLabel = String(ctx.productBaseLabel ?? data.label).trim() || `Producto ${code}`;
      const presentationId = String(ctx.presentationId ?? "").trim();
      const presentationLabel = String(ctx.presentationLabel ?? "").trim() || "Presentación contextual";
      const unitId = String(ctx.unitId ?? "").trim();
      const unitLabel = String(ctx.unitLabel ?? "").trim() || "Unidad contextual";

      const resolvedProductBase = productBaseId
        ? await this.prisma.productBase.findUnique({ where: { id: productBaseId } })
        : await this.prisma.productBase.create({ data: { code: `PB-${Date.now()}`, name: productBaseLabel } });

      let resolvedPresentation = presentationId
        ? await this.prisma.presentation.findUnique({ where: { id: presentationId }, include: { unit: true } })
        : null;

      if (!resolvedPresentation) {
        const resolvedUnit = unitId
          ? await this.prisma.unit.findUnique({ where: { id: unitId } })
          : await this.prisma.unit.create({ data: { code: `UNIT-${Date.now()}`, name: unitLabel } });

        resolvedPresentation = await this.prisma.presentation.create({
          data: { name: presentationLabel, unitId: resolvedUnit?.id ?? null },
          include: { unit: true },
        });
      }

      if (!resolvedProductBase || !resolvedPresentation) {
        throw new Error("No se pudo resolver el contexto anidado para crear SKU.");
      }

      const created = await this.prisma.sKU.create({
        data: { code, productBaseId: resolvedProductBase.id, presentationId: resolvedPresentation.id },
      });
      return {
        id: created.id,
        label: created.code,
        meta: `${resolvedProductBase.name} · ${resolvedPresentation.name} · ${resolvedPresentation.unit?.name ?? "Sin unidad"}`,
      };
    }
    if (entityType === "alias") {
      const created = await this.prisma.entityAlias.create({
        data: { alias: data.label, entityType: data.meta?.trim() || "generic", canonicalName: data.label }
      });
      return { id: created.id, label: created.alias, meta: created.entityType };
    }
    if (entityType === "proveedor") {
      const created = await this.prisma.supplier.create({ data: { code, name: data.label } });
      return { id: created.id, label: created.name, meta: created.code };
    }
    if (entityType === "cliente") {
      const created = await this.prisma.customer.create({ data: { code, name: data.label } });
      return { id: created.id, label: created.name, meta: created.code };
    }
    if (entityType === "direccion") {
      const customerId = String(ctx.customerId ?? "").trim();
      const customer = customerId
        ? await this.prisma.customer.findUnique({ where: { id: customerId } })
        : await this.prisma.customer.findFirst({ orderBy: { id: "desc" } });
      if (!customer) {
        throw new Error("Para crear dirección contextual se requiere al menos un cliente.");
      }
      const created = await this.prisma.customerAddress.create({
        data: { customerId: customer.id, label: data.label, address: data.meta?.trim() || data.label, city: "N/A" }
      });
      return { id: created.id, label: created.label, meta: customer.name };
    }
    if (entityType === "lista") {
      const created = await this.prisma.priceList.create({ data: { code, name: data.label, startsAt: new Date() } });
      return { id: created.id, label: created.name, meta: created.code };
    }
    if (entityType === "cuenta") {
      const created = await this.prisma.cashAccount.create({ data: { name: data.label, type: data.meta?.trim() || "cash" } });
      return { id: created.id, label: created.name, meta: created.type };
    }
    if (entityType === "cuenta_cobrar") {
      const customerId = String(ctx.customerId ?? "").trim();
      const customer = customerId
        ? await this.prisma.customer.findUnique({ where: { id: customerId } })
        : await this.prisma.customer.findFirst({ orderBy: { id: "desc" } });
      const resolvedCustomer = customer ?? await this.prisma.customer.create({ data: { code: `C-${Date.now()}`, name: "Cliente contextual" } });

      const salesOrderId = String(ctx.salesOrderId ?? "").trim();
      const order = salesOrderId
        ? await this.prisma.salesOrder.findUnique({ where: { id: salesOrderId } })
        : await this.prisma.salesOrder.findFirst({ where: { customerId: resolvedCustomer.id }, orderBy: { id: "desc" } });
      const priceList = await this.prisma.priceList.findFirst({ orderBy: { id: "desc" } })
        ?? await this.prisma.priceList.create({ data: { code: `PL-${Date.now()}`, name: "Lista contextual", startsAt: new Date() } });
      const resolvedOrder = order ?? await this.prisma.salesOrder.create({ data: { code: `SO-${Date.now()}`, customerId: resolvedCustomer.id, priceListId: priceList.id, total: 1 } });

      const created = await this.prisma.accountsReceivable.create({
        data: {
          customerId: resolvedCustomer.id,
          salesOrderId: resolvedOrder.id,
          dueDate: new Date(),
          amount: 1,
          balance: 1,
        },
      });
      return { id: created.id, label: `CxC ${created.id.slice(-6)}`, meta: resolvedCustomer.name };
    }
    if (entityType === "formula_version") {
      const template = await this.prisma.formulaTemplate.findFirst({ orderBy: { id: "desc" } });
      if (!template) {
        throw new Error("Para crear versión de fórmula contextual se requiere al menos una plantilla.");
      }
      const last = await this.prisma.formulaVersion.findFirst({ where: { templateId: template.id }, orderBy: { version: "desc" } });
      const created = await this.prisma.formulaVersion.create({
        data: { templateId: template.id, version: (last?.version ?? 0) + 1, status: "draft" },
        include: { template: true },
      });
      return { id: created.id, label: `${created.template.code} v${created.version}`, meta: created.status };
    }

    const supplierId = String(ctx.supplierId ?? "").trim();
    const supplier = supplierId
      ? await this.prisma.supplier.findUnique({ where: { id: supplierId } })
      : await this.prisma.supplier.findFirst({ orderBy: { id: "desc" } });
    const resolvedSupplier = supplier ?? await this.prisma.supplier.create({ data: { code: `S-${Date.now()}`, name: "Proveedor contextual" } });

    const created = await this.prisma.accountsPayable.create({
      data: {
        supplierId: resolvedSupplier.id,
        sourceType: data.meta?.trim() || "manual",
        sourceId: code,
        dueDate: new Date(),
        amount: 1,
        balance: 1,
      },
    });
    return { id: created.id, label: `CxP ${created.id.slice(-6)}`, meta: resolvedSupplier.name };
  }

  createContextualAudit(input: { entityType: ContextualEntityType; entityId: string; originFlow?: string; payload: CreateContextualEntityInput; created: ContextualOptionDto }) {
    return this.auditTrailService.logCreate({
      entity: `contextual:${input.entityType}`,
      entityId: input.entityId,
      origin: input.originFlow ?? "nested-flow",
      before: { originFlow: input.originFlow ?? null },
      after: {
        originFlow: input.originFlow ?? null,
        payload: input.payload,
        created: input.created,
      },
    });
  }
}

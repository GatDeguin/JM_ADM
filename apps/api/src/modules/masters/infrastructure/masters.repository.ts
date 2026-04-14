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
    const updated = await this.prisma.unit.update({ where: { id }, data: { status: "inactive" } }) as Promise<UnitDto>;
    await this.auditTrailService.logHomologation({ entity: "Unit", entityId: id, origin: "masters.runAction", before: previous, after: updated });
    return updated;
  }

  async listContextualOptions(entityType: ContextualEntityType): Promise<ContextualOptionDto[]> {
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
    if (entityType === "lista") {
      const rows = await this.prisma.priceList.findMany({ take: 50, orderBy: { id: "desc" } });
      return rows.map((row: any) => ({ id: row.id, label: row.name, meta: row.code }));
    }
    const rows = await this.prisma.cashAccount.findMany({ take: 50, orderBy: { id: "desc" } });
    return rows.map((row: any) => ({ id: row.id, label: row.name, meta: row.type }));
  }

  async createContextualEntity(entityType: ContextualEntityType, data: CreateContextualEntityInput): Promise<ContextualOptionDto> {
    const code = `CTX-${Date.now()}`;

    if (entityType === "presentacion") {
      const created = await this.prisma.presentation.create({ data: { name: data.label } });
      return { id: created.id, label: created.name };
    }
    if (entityType === "unidad") {
      const created = await this.prisma.unit.create({ data: { name: data.label, code } });
      return { id: created.id, label: created.name, meta: created.code };
    }
    if (entityType === "sku") {
      const [productBase, presentation] = await Promise.all([
        this.prisma.productBase.findFirst({ orderBy: { id: "desc" } }),
        this.prisma.presentation.findFirst({ orderBy: { id: "desc" } })
      ]);
      if (!productBase || !presentation) {
        throw new Error("Para crear SKU contextual se requiere al menos un producto base y una presentación.");
      }
      const created = await this.prisma.sKU.create({
        data: { code, productBaseId: productBase.id, presentationId: presentation.id }
      });
      return { id: created.id, label: created.code, meta: `${productBase.name} · ${presentation.name}` };
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
    if (entityType === "lista") {
      const created = await this.prisma.priceList.create({ data: { code, name: data.label, startsAt: new Date() } });
      return { id: created.id, label: created.name, meta: created.code };
    }
    const created = await this.prisma.cashAccount.create({ data: { name: data.label, type: data.meta?.trim() || "cash" } });
    return { id: created.id, label: created.name, meta: created.type };
  }

  createContextualAudit(input: { entityType: ContextualEntityType; entityId: string; originFlow?: string; payload: CreateContextualEntityInput }) {
    return this.auditTrailService.logCreate({
      entity: `contextual:${input.entityType}`,
      entityId: input.entityId,
      origin: input.originFlow ?? "nested-flow",
      after: input.payload,
    });
  }
}

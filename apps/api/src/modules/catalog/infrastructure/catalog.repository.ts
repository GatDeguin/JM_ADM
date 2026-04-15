import { Injectable } from "@nestjs/common";
import { buildDomainEvent, DOMAIN_EVENT_NAMES } from "../../../common/events/domain-event-contract";
import { DomainEventsService } from "../../../common/events/domain-events.service";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";

@Injectable()
export class CatalogRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly domainEvents: DomainEventsService,
  ) {}

  findFamilies() {
    return this.prisma.family.findMany({ orderBy: { name: "asc" } });
  }

  createFamily(data: { name: string; status?: "draft" | "active" | "inactive" | "pending_homologation" | "archived" }) {
    return this.prisma.family.create({ data });
  }

  findProductBases() {
    return this.prisma.productBase.findMany({ orderBy: { name: "asc" }, include: { family: true, line: true, variant: true } });
  }

  createProductBase(data: {
    code: string;
    name: string;
    familyId?: string;
    variantId?: string;
    lineId?: string;
    status?: "draft" | "active" | "inactive" | "pending_homologation" | "archived";
  }) {
    return this.prisma.productBase.create({ data });
  }

  findPresentations() {
    return this.prisma.presentation.findMany({ orderBy: { name: "asc" }, include: { unit: true } });
  }

  createPresentation(data: { name: string; unitId?: string; factor?: number; status?: "draft" | "active" | "inactive" | "pending_homologation" | "archived" }) {
    return this.prisma.presentation.create({ data });
  }

  findSkus() {
    return this.prisma.sKU.findMany({ orderBy: { code: "asc" }, include: { productBase: true, presentation: true } });
  }

  createSku(data: {
    code: string;
    productBaseId: string;
    presentationId: string;
    barcode?: string;
    status?: "draft" | "active" | "inactive" | "pending_homologation" | "archived";
  }) {
    return this.prisma.$transaction(async (tx: any) => {
      const created = await tx.sKU.create({ data });
      const event = buildDomainEvent(DOMAIN_EVENT_NAMES.skuCreated, { skuId: created.id, code: created.code });
      this.domainEvents.emit(event);
      await tx.auditLog.create({
        data: {
          entity: "DomainEvent",
          entityId: created.id,
          action: "emit",
          origin: "catalog.createSku",
          after: event,
        },
      });
      return created;
    });
  }

  findPackagingSpecs() {
    return this.prisma.packagingSpec.findMany({ orderBy: { skuId: "asc" }, include: { sku: true, item: true } });
  }

  createPackagingSpec(data: { skuId: string; componentType: string; itemId: string; qty: number }) {
    return this.prisma.packagingSpec.create({ data: { ...data, qty: data.qty } });
  }

  findCombos() {
    return this.prisma.comboPack.findMany({ orderBy: { code: "asc" }, include: { ComboPackItem: { include: { sku: true } } } });
  }

  createCombo(data: {
    code: string;
    name: string;
    status?: "draft" | "active" | "inactive" | "pending_homologation" | "archived";
    items: Array<{ skuId: string; qty: number }>;
  }) {
    return this.prisma.comboPack.create({
      data: {
        code: data.code,
        name: data.name,
        status: data.status,
        ComboPackItem: { create: data.items.map((item) => ({ skuId: item.skuId, qty: item.qty })) },
      },
      include: { ComboPackItem: true },
    });
  }

  findAliases() {
    return this.prisma.entityAlias.findMany({ orderBy: { alias: "asc" } });
  }

  createAlias(data: {
    entityType: string;
    alias: string;
    canonicalId?: string;
    canonicalName?: string;
    originalValue?: string;
    status?: "draft" | "active" | "inactive" | "pending_homologation" | "archived";
  }) {
    return this.prisma.entityAlias.create({ data });
  }

  homologateAlias(data: { entityType: string; alias: string; canonicalId: string; canonicalName: string }) {
    return this.prisma.entityAlias.upsert({
      where: { entityType_alias: { entityType: data.entityType, alias: data.alias } },
      update: {
        canonicalId: data.canonicalId,
        canonicalName: data.canonicalName,
        status: "active",
      },
      create: {
        entityType: data.entityType,
        alias: data.alias,
        canonicalId: data.canonicalId,
        canonicalName: data.canonicalName,
        status: "active",
      },
    });
  }

  async mergeCanonical(data: {
    entityType: "family" | "product_base" | "presentation" | "sku" | "combo";
    sourceId: string;
    targetId: string;
    createSourceAlias?: boolean;
  }) {
    if (data.sourceId === data.targetId) return { merged: false, reason: "source_equals_target" };

    return this.prisma.$transaction(async (tx: any) => {
      const source = await this.findCanonicalByType(tx, data.entityType, data.sourceId);
      await this.findCanonicalByType(tx, data.entityType, data.targetId);

      await tx.entityAlias.updateMany({
        where: { entityType: data.entityType, canonicalId: data.sourceId },
        data: { canonicalId: data.targetId },
      });

      if (data.createSourceAlias && source.aliasCandidate) {
        await tx.entityAlias.upsert({
          where: { entityType_alias: { entityType: data.entityType, alias: source.aliasCandidate } },
          update: { canonicalId: data.targetId, canonicalName: source.aliasCandidate, status: "active" },
          create: {
            entityType: data.entityType,
            alias: source.aliasCandidate,
            canonicalId: data.targetId,
            canonicalName: source.aliasCandidate,
            status: "active",
            originalValue: source.aliasCandidate,
          },
        });
      }

      await this.archiveCanonicalByType(tx, data.entityType, data.sourceId);

      return { merged: true, sourceId: data.sourceId, targetId: data.targetId };
    });
  }

  async searchCatalog(rawQuery: string) {
    const query = rawQuery.trim();
    if (!query) {
      return { query, families: [], productBases: [], skus: [], aliases: [] };
    }

    const [families, productBases, skus, aliases] = await Promise.all([
      this.prisma.family.findMany({ where: { name: { contains: query, mode: "insensitive" } }, take: 20, orderBy: { name: "asc" } }),
      this.prisma.productBase.findMany({
        where: {
          OR: [
            { code: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { family: true },
        take: 20,
        orderBy: { name: "asc" },
      }),
      this.prisma.sKU.findMany({
        where: {
          OR: [{ code: { contains: query, mode: "insensitive" } }, { barcode: { contains: query, mode: "insensitive" } }],
        },
        include: { productBase: true, presentation: true },
        take: 20,
        orderBy: { code: "asc" },
      }),
      this.prisma.entityAlias.findMany({
        where: {
          OR: [{ alias: { contains: query, mode: "insensitive" } }, { canonicalName: { contains: query, mode: "insensitive" } }],
        },
        take: 20,
        orderBy: { alias: "asc" },
      }),
    ]);

    return { query, families, productBases, skus, aliases };
  }

  async contextualUpsert(data: {
    entityType: "family" | "product_base" | "presentation" | "sku" | "combo" | "alias";
    label: string;
    code?: string;
    originFlow: string;
    context?: Record<string, unknown>;
    status?: "draft" | "active" | "inactive" | "pending_homologation" | "archived";
  }) {
    const status = data.status ?? "pending_homologation";
    const normalizedLabel = data.label.trim();

    if (data.entityType === "family") {
      const entity = await this.prisma.family.upsert({
        where: { name: normalizedLabel },
        update: {},
        create: { name: normalizedLabel, status },
      });
      return this.createContextualResponse(data, entity.id, entity.name, undefined);
    }

    if (data.entityType === "product_base") {
      const code = data.code?.trim() || `CTX-PB-${Date.now()}`;
      const entity = await this.prisma.productBase.upsert({
        where: { code },
        update: {},
        create: { code, name: normalizedLabel, status },
      });
      return this.createContextualResponse(data, entity.id, entity.name, entity.code);
    }

    if (data.entityType === "presentation") {
      const entity = await this.prisma.presentation.create({
        data: { name: normalizedLabel, status },
      });
      return this.createContextualResponse(data, entity.id, entity.name, undefined);
    }

    if (data.entityType === "sku") {
      const code = data.code?.trim() || `CTX-SKU-${Date.now()}`;
      const productBaseId = String(data.context?.productBaseId || "").trim();
      const presentationId = String(data.context?.presentationId || "").trim();

      if (!productBaseId || !presentationId) {
        throw new Error("Para alta contextual de SKU se requieren context.productBaseId y context.presentationId.");
      }

      const entity = await this.prisma.sKU.upsert({
        where: { code },
        update: {},
        create: { code, productBaseId, presentationId, status },
      });
      return this.createContextualResponse(data, entity.id, entity.code, entity.code);
    }

    if (data.entityType === "combo") {
      const code = data.code?.trim() || `CTX-CMB-${Date.now()}`;
      const entity = await this.prisma.comboPack.upsert({
        where: { code },
        update: {},
        create: { code, name: normalizedLabel, status },
      });
      return this.createContextualResponse(data, entity.id, entity.name, entity.code);
    }

    const entityType = (data.context?.entityType as string) || "generic";
    const entity = await this.prisma.entityAlias.upsert({
      where: { entityType_alias: { entityType, alias: normalizedLabel } },
      update: { status },
      create: {
        entityType,
        alias: normalizedLabel,
        canonicalId: (data.context?.canonicalId as string) || null,
        canonicalName: (data.context?.canonicalName as string) || normalizedLabel,
        originalValue: normalizedLabel,
        status,
      },
    });
    return this.createContextualResponse(data, entity.id, entity.alias, entity.canonicalName ?? undefined);
  }

  private createContextualResponse(
    data: { entityType: string; originFlow: string; context?: Record<string, unknown> },
    id: string,
    label: string,
    code?: string,
  ) {
    return {
      id,
      label,
      code,
      entityType: data.entityType,
      status: "pending_homologation",
      originFlow: data.originFlow,
      context: data.context ?? {},
    };
  }

  private async findCanonicalByType(tx: any, entityType: string, id: string) {
    if (entityType === "family") {
      const row = await tx.family.findUniqueOrThrow({ where: { id }, select: { name: true } });
      return { aliasCandidate: row.name };
    }
    if (entityType === "product_base") {
      const row = await tx.productBase.findUniqueOrThrow({ where: { id }, select: { code: true, name: true } });
      return { aliasCandidate: row.code || row.name };
    }
    if (entityType === "presentation") {
      const row = await tx.presentation.findUniqueOrThrow({ where: { id }, select: { name: true } });
      return { aliasCandidate: row.name };
    }
    if (entityType === "sku") {
      const row = await tx.sKU.findUniqueOrThrow({ where: { id }, select: { code: true } });
      return { aliasCandidate: row.code };
    }
    const row = await tx.comboPack.findUniqueOrThrow({ where: { id }, select: { code: true, name: true } });
    return { aliasCandidate: row.code || row.name };
  }

  private archiveCanonicalByType(tx: any, entityType: string, sourceId: string) {
    if (entityType === "family") {
      return tx.family.update({ where: { id: sourceId }, data: { status: "archived" } });
    }
    if (entityType === "product_base") {
      return tx.productBase.update({ where: { id: sourceId }, data: { status: "archived" } });
    }
    if (entityType === "presentation") {
      return tx.presentation.update({ where: { id: sourceId }, data: { status: "archived" } });
    }
    if (entityType === "sku") {
      return tx.sKU.update({ where: { id: sourceId }, data: { status: "archived" } });
    }
    return tx.comboPack.update({ where: { id: sourceId }, data: { status: "archived" } });
  }
}

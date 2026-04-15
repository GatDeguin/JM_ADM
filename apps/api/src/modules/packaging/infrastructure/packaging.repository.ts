import { Injectable } from "@nestjs/common";
import { buildDomainEvent, DOMAIN_EVENT_NAMES } from "../../../common/events/domain-event-contract";
import { DomainEventsService } from "../../../common/events/domain-events.service";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionPackagingOrderInput, CreatePackagingOrderInput, PackagingOrderDto, UpdatePackagingOrderInput } from "../domain/packaging.types";

const packagingOrderInclude = {
  parentBatch: { select: { id: true, code: true, status: true } },
  sku: { select: { id: true, code: true, status: true } },
} as const;

@Injectable()
export class PackagingRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly domainEvents: DomainEventsService,
  ) {}

  list(): Promise<PackagingOrderDto[]> {
    return this.prisma.packagingOrder.findMany({ orderBy: { id: "desc" }, include: packagingOrderInclude }) as Promise<PackagingOrderDto[]>;
  }

  get(id: string): Promise<PackagingOrderDto> {
    return this.prisma.packagingOrder.findUniqueOrThrow({ where: { id }, include: packagingOrderInclude }) as Promise<PackagingOrderDto>;
  }

  create(data: CreatePackagingOrderInput): Promise<PackagingOrderDto> {
    return this.prisma.packagingOrder.create({ data: data as any, include: packagingOrderInclude }) as Promise<PackagingOrderDto>;
  }

  update(id: string, data: UpdatePackagingOrderInput): Promise<PackagingOrderDto> {
    return this.prisma.packagingOrder.update({ where: { id }, data: data as any, include: packagingOrderInclude }) as Promise<PackagingOrderDto>;
  }

  remove(id: string) {
    return this.prisma.packagingOrder.update({ where: { id }, data: { status: "cancelled" }, include: packagingOrderInclude });
  }

  runAction(id: string, payload: ActionPackagingOrderInput): Promise<PackagingOrderDto> {
    void payload;
    return this.prisma.$transaction(async (tx: any) => {
      const updated = await tx.packagingOrder.update({ where: { id }, data: { status: "released" }, include: packagingOrderInclude }) as PackagingOrderDto;
      const event = buildDomainEvent(DOMAIN_EVENT_NAMES.packagingClosed, {
        packagingOrderId: updated.id,
        status: updated.status,
      });
      this.domainEvents.emit(event);
      await tx.auditLog.create({
        data: {
          entity: "DomainEvent",
          entityId: updated.id,
          action: "emit",
          origin: "packaging.runAction",
          after: event,
        },
      });
      return updated;
    });
  }
}

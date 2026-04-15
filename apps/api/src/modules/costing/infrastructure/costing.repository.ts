import { Injectable } from "@nestjs/common";
import { buildDomainEvent, DOMAIN_EVENT_NAMES } from "../../../common/events/domain-event-contract";
import { DomainEventsService } from "../../../common/events/domain-events.service";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionMonthlyCloseInput, CreateMonthlyCloseInput, MonthlyCloseDto, UpdateMonthlyCloseInput } from "../domain/costing.types";

@Injectable()
export class CostingRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly domainEvents: DomainEventsService,
  ) {}

  list(): Promise<MonthlyCloseDto[]> { return this.prisma.monthlyClose.findMany({ orderBy: { id: "desc" } }) as Promise<MonthlyCloseDto[]>; }
  get(id: string): Promise<MonthlyCloseDto> { return this.prisma.monthlyClose.findUniqueOrThrow({ where: { id } }) as Promise<MonthlyCloseDto>; }
  create(data: CreateMonthlyCloseInput): Promise<MonthlyCloseDto> { return this.prisma.monthlyClose.create({ data: data as any }) as Promise<MonthlyCloseDto>; }
  update(id: string, data: UpdateMonthlyCloseInput): Promise<MonthlyCloseDto> { return this.prisma.monthlyClose.update({ where: { id }, data: data as any }) as Promise<MonthlyCloseDto>; }
  remove(id: string) { return this.prisma.monthlyClose.delete({ where: { id } }); }

  runAction(id: string, payload: ActionMonthlyCloseInput): Promise<MonthlyCloseDto> {
    void payload;
    return this.prisma.$transaction(async (tx: any) => {
      const closed = await tx.monthlyClose.update({ where: { id }, data: { status: "closed", closedAt: new Date() } }) as MonthlyCloseDto;
      const event = buildDomainEvent(DOMAIN_EVENT_NAMES.monthlyCloseClosed, {
        monthlyCloseId: closed.id,
        status: closed.status,
        closedAt: (closed.closedAt ? new Date(closed.closedAt) : new Date()).toISOString(),
      });
      this.domainEvents.emit(event);
      await tx.auditLog.create({
        data: {
          entity: "DomainEvent",
          entityId: closed.id,
          action: "emit",
          origin: "costing.runAction",
          after: event,
        },
      });
      return closed;
    });
  }
}

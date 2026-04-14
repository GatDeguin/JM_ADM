import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionAccountsPayableInput, CreateAccountsPayableInput, AccountsPayableDto, UpdateAccountsPayableInput } from "../domain/payables_treasury.types";
import { AuditTrailService } from "../../audit/application/audit-trail.service";

const accountsPayableInclude = {
  supplier: { select: { id: true, code: true, name: true, status: true } },
} as const;

const noopAuditTrail = {
  logCreate: async () => undefined,
  logUpdate: async () => undefined,
  logTransactionalAction: async () => undefined,
};

@Injectable()
export class PayablesTreasuryRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditTrailService: Pick<AuditTrailService, "logCreate" | "logUpdate" | "logTransactionalAction"> = noopAuditTrail,
  ) {}

  list(): Promise<AccountsPayableDto[]> {
    return this.prisma.accountsPayable.findMany({ orderBy: { id: "desc" }, include: accountsPayableInclude }) as Promise<AccountsPayableDto[]>;
  }

  get(id: string): Promise<AccountsPayableDto> {
    return this.prisma.accountsPayable.findUniqueOrThrow({ where: { id }, include: accountsPayableInclude }) as Promise<AccountsPayableDto>;
  }

  async create(data: CreateAccountsPayableInput): Promise<AccountsPayableDto> {
    const created = await this.prisma.accountsPayable.create({ data: data as any, include: accountsPayableInclude }) as AccountsPayableDto;
    await this.auditTrailService.logCreate({ entity: "AccountsPayable", entityId: created.id, origin: "payables.create", after: created });
    return created;
  }

  async update(id: string, data: UpdateAccountsPayableInput): Promise<AccountsPayableDto> {
    const previous = await this.prisma.accountsPayable.findUniqueOrThrow({ where: { id }, include: accountsPayableInclude });
    const updated = await this.prisma.accountsPayable.update({ where: { id }, data: data as any, include: accountsPayableInclude }) as AccountsPayableDto;
    await this.auditTrailService.logUpdate({ entity: "AccountsPayable", entityId: id, origin: "payables.update", before: previous, after: updated });
    return updated;
  }

  remove(id: string) {
    return this.prisma.accountsPayable.update({ where: { id }, data: { status: "cancelled" }, include: accountsPayableInclude });
  }

  runAction(id: string, payload: ActionAccountsPayableInput): Promise<AccountsPayableDto> {
    return this.prisma.$transaction(async (tx: any) => {
      const payable = await tx.accountsPayable.findUniqueOrThrow({ where: { id } });
      const payment = await tx.payment.create({ data: { code: payload.code, supplierId: payable.supplierId, cashAccountId: payload.cashAccountId, amount: payload.amount } });
      await tx.paymentAllocation.create({ data: { paymentId: payment.id, payableId: payable.id, amount: payload.amount } });
      await tx.treasuryMovement.create({ data: { cashAccountId: payload.cashAccountId, type: "outflow", amount: payload.amount, reference: payment.code } });
      const updated = await tx.accountsPayable.update({ where: { id }, data: { balance: { decrement: payload.amount as never }, status: "partial" }, include: accountsPayableInclude }) as AccountsPayableDto;
      await this.auditTrailService.logTransactionalAction(
        {
          entity: "AccountsPayable",
          entityId: id,
          origin: "payables.runAction.payment",
          before: payable,
          after: { updated, paymentId: payment.id, amount: payload.amount },
        },
        tx,
      );
      return updated;
    });
  }
}

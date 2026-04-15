import { HttpStatus, Injectable } from "@nestjs/common";
import { throwDomainError } from "../../../common/domain-rules/domain-errors";
import { buildDomainEvent, DOMAIN_EVENT_NAMES } from "../../../common/events/domain-event-contract";
import { DomainEventsService } from "../../../common/events/domain-events.service";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionAccountsPayableInput, CreateAccountsPayableInput, AccountsPayableDto, ReconcileBankInput, TransferFundsInput, UpdateAccountsPayableInput } from "../domain/payables_treasury.types";
import { AuditTrailService } from "../../audit/application/audit-trail.service";

const accountsPayableInclude = {
  supplier: { select: { id: true, code: true, name: true, status: true } },
} as const;

const noopAuditTrail = {
  logCreate: async () => undefined,
  logUpdate: async () => undefined,
  logTransactionalAction: async () => undefined,
};
const noopDomainEvents = { emit: () => undefined, on: () => undefined } as unknown as DomainEventsService;

function resolveAccountStatus(balance: number, dueDate: Date, amount: number): "open" | "partial" | "paid" | "overdue" {
  if (balance <= 0) return "paid";
  if (dueDate < new Date()) return "overdue";
  return balance < amount ? "partial" : "open";
}

@Injectable()
export class PayablesTreasuryRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditTrailService: Pick<AuditTrailService, "logCreate" | "logUpdate" | "logTransactionalAction"> = noopAuditTrail,
    private readonly domainEvents: DomainEventsService = noopDomainEvents,
  ) {}

  list(): Promise<AccountsPayableDto[]> {
    return this.prisma.accountsPayable.findMany({ orderBy: { id: "desc" }, include: accountsPayableInclude }) as Promise<AccountsPayableDto[]>;
  }

  get(id: string): Promise<AccountsPayableDto> {
    return this.prisma.accountsPayable.findUniqueOrThrow({ where: { id }, include: accountsPayableInclude }) as Promise<AccountsPayableDto>;
  }

  async create(data: CreateAccountsPayableInput): Promise<AccountsPayableDto> {
    const created = await this.prisma.accountsPayable.create({ data: { ...data, balance: data.amount } as any, include: accountsPayableInclude }) as AccountsPayableDto;
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

  async runAction(payload: ActionAccountsPayableInput): Promise<{ paymentId: string; payables: AccountsPayableDto[] }> {
    const allocationTotal = payload.allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
    if (allocationTotal > payload.amount) {
      throwDomainError("RULE_PAYABLES_ALLOCATION_TOTAL", "Las imputaciones no pueden exceder el importe pagado.", HttpStatus.BAD_REQUEST, "R-PT-002");
    }

    return this.prisma.$transaction(async (tx: any) => {
      const first = await tx.accountsPayable.findUniqueOrThrow({ where: { id: payload.allocations[0]?.payableId } });
      const payment = await tx.payment.create({ data: { code: payload.code, supplierId: first.supplierId, cashAccountId: payload.cashAccountId, amount: payload.amount } });
      const payables: AccountsPayableDto[] = [];
      const supplierIds = new Set<string>();

      for (const allocation of payload.allocations) {
        const payable = await tx.accountsPayable.findUniqueOrThrow({ where: { id: allocation.payableId } });
        supplierIds.add(payable.supplierId);
        if (allocation.amount > Number(payable.balance)) {
          throwDomainError("RULE_PAYABLES_ALLOCATION_BALANCE", "La imputación no puede superar el saldo pendiente de la cuenta a pagar.", HttpStatus.CONFLICT, "R-PT-004");
        }
        await tx.paymentAllocation.create({ data: { paymentId: payment.id, payableId: payable.id, amount: allocation.amount } });
        const nextBalance = Number(payable.balance) - allocation.amount;
        const updated = await tx.accountsPayable.update({
          where: { id: payable.id },
          data: { balance: { decrement: allocation.amount as never }, status: resolveAccountStatus(nextBalance, payable.dueDate, Number(payable.amount)) },
          include: accountsPayableInclude,
        }) as AccountsPayableDto;
        payables.push(updated);
      }

      if (supplierIds.size > 1) {
        throwDomainError("RULE_PAYABLES_SINGLE_SUPPLIER", "Todas las imputaciones del pago deben pertenecer al mismo proveedor.", HttpStatus.CONFLICT, "R-PT-003");
      }

      await tx.treasuryMovement.create({ data: { cashAccountId: payload.cashAccountId, type: "outflow", amount: payload.amount, reference: payment.code } });
      await this.auditTrailService.logTransactionalAction(
        {
          entity: "AccountsPayable",
          entityId: first.id,
          origin: "payables.runAction.payment",
          before: first,
          after: { paymentId: payment.id, amount: payload.amount, allocations: payload.allocations },
        },
        tx,
      );
      const event = buildDomainEvent(DOMAIN_EVENT_NAMES.paymentRegistered, {
        paymentId: payment.id,
        cashAccountId: payload.cashAccountId,
        amount: payload.amount,
      });
      this.domainEvents.emit(event);
      await tx.auditLog.create({
        data: {
          entity: "DomainEvent",
          entityId: payment.id,
          action: "emit",
          origin: "payables.runAction",
          after: event,
        },
      });

      return { paymentId: payment.id, payables };
    });
  }

  transferFunds(payload: TransferFundsInput) {
    return this.prisma.$transaction(async (tx: any) => {
      const outflow = await tx.treasuryMovement.create({
        data: { cashAccountId: payload.fromCashAccountId, type: "transfer_out", amount: payload.amount, reference: payload.reference ?? "transfer" },
      });
      const inflow = await tx.treasuryMovement.create({
        data: { cashAccountId: payload.toCashAccountId, type: "transfer_in", amount: payload.amount, reference: payload.reference ?? "transfer" },
      });
      return { outflow, inflow };
    });
  }

  reconcileBank(payload: ReconcileBankInput) {
    return this.prisma.bankReconciliation.upsert({
      where: { cashAccountId_period: { cashAccountId: payload.cashAccountId, period: payload.period } },
      create: payload,
      update: { status: payload.status },
    });
  }
}

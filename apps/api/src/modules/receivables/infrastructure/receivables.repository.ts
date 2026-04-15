import { HttpStatus, Injectable } from "@nestjs/common";
import { throwDomainError } from "../../../common/domain-rules/domain-errors";
import { buildDomainEvent, DOMAIN_EVENT_NAMES } from "../../../common/events/domain-event-contract";
import { DomainEventsService } from "../../../common/events/domain-events.service";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionAccountsReceivableInput, CreateAccountsReceivableInput, AccountsReceivableDto, UpdateAccountsReceivableInput } from "../domain/receivables.types";

function resolveAccountStatus(balance: number, dueDate: Date, amount: number): "open" | "partial" | "paid" | "overdue" {
  if (balance <= 0) return "paid";
  if (dueDate < new Date()) return "overdue";
  return balance < amount ? "partial" : "open";
}

@Injectable()
export class ReceivablesRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly domainEvents: DomainEventsService,
  ) {}

  async list(): Promise<AccountsReceivableDto[]> {
    const rows = await this.prisma.accountsReceivable.findMany({ orderBy: { dueDate: "asc" } });
    return rows.map((row: any) => ({ ...row, status: resolveAccountStatus(Number(row.balance), row.dueDate, Number(row.amount)) }));
  }

  async get(id: string): Promise<AccountsReceivableDto> {
    const row = await this.prisma.accountsReceivable.findUniqueOrThrow({ where: { id } });
    return { ...row, status: resolveAccountStatus(Number(row.balance), row.dueDate, Number(row.amount)) };
  }

  async create(data: CreateAccountsReceivableInput): Promise<AccountsReceivableDto> {
    const created = await this.prisma.accountsReceivable.create({
      data: { ...data, balance: data.amount, status: new Date(data.dueDate) < new Date() ? "overdue" : "open" } as any,
    });
    return created as AccountsReceivableDto;
  }

  update(id: string, data: UpdateAccountsReceivableInput): Promise<AccountsReceivableDto> {
    return this.prisma.accountsReceivable.update({ where: { id }, data: data as any }) as Promise<AccountsReceivableDto>;
  }

  remove(id: string) { return this.prisma.accountsReceivable.delete({ where: { id } }); }

  async runAction(payload: ActionAccountsReceivableInput): Promise<{ receiptId: string; receivables: AccountsReceivableDto[] }> {
    const allocationTotal = payload.allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
    if (allocationTotal > payload.amount) {
      throwDomainError("RULE_RECEIVABLES_ALLOCATION_TOTAL", "Las imputaciones no pueden exceder el monto del recibo.", HttpStatus.BAD_REQUEST, "R-RV-002");
    }

    return this.prisma.$transaction(async (tx: any) => {
      const first = await tx.accountsReceivable.findUniqueOrThrow({ where: { id: payload.allocations[0]?.receivableId } });
      const receipt = await tx.receipt.create({
        data: { code: payload.code, customerId: first.customerId, cashAccountId: payload.cashAccountId, amount: payload.amount },
      });

      const receivables: AccountsReceivableDto[] = [];
      const customerIds = new Set<string>();
      for (const allocation of payload.allocations) {
        const receivable = await tx.accountsReceivable.findUniqueOrThrow({ where: { id: allocation.receivableId } });
        customerIds.add(receivable.customerId);
        if (allocation.amount > Number(receivable.balance)) {
          throwDomainError("RULE_RECEIVABLES_ALLOCATION_BALANCE", "La imputación no puede superar el saldo pendiente de la cuenta a cobrar.", HttpStatus.CONFLICT, "R-RV-004");
        }
        await tx.receiptAllocation.create({ data: { receiptId: receipt.id, receivableId: receivable.id, amount: allocation.amount } });
        const nextBalance = Number(receivable.balance) - allocation.amount;
        const updated = await tx.accountsReceivable.update({
          where: { id: receivable.id },
          data: { balance: { decrement: allocation.amount as never }, status: resolveAccountStatus(nextBalance, receivable.dueDate, Number(receivable.amount)) },
        });
        receivables.push(updated as AccountsReceivableDto);
      }

      if (customerIds.size > 1) {
        throwDomainError("RULE_RECEIVABLES_SINGLE_CUSTOMER", "Todas las imputaciones del recibo deben pertenecer al mismo cliente.", HttpStatus.CONFLICT, "R-RV-003");
      }

      const event = buildDomainEvent(DOMAIN_EVENT_NAMES.receiptRegistered, {
        receiptId: receipt.id,
        cashAccountId: payload.cashAccountId,
        amount: payload.amount,
      });
      this.domainEvents.emit(event);
      await tx.auditLog.create({
        data: {
          entity: "DomainEvent",
          entityId: receipt.id,
          action: "emit",
          origin: "receivables.runAction",
          after: event,
        },
      });

      return { receiptId: receipt.id, receivables };
    });
  }

  async agingAgenda() {
    const rows = await this.prisma.accountsReceivable.findMany({ orderBy: { dueDate: "asc" } });
    const today = new Date();
    const agenda = rows.map((row: any) => {
      const diffDays = Math.ceil((row.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const bucket = diffDays < 0 ? "overdue" : diffDays <= 7 ? "due_7d" : diffDays <= 30 ? "due_30d" : "future";
      return { ...row, bucket, daysToDue: diffDays, status: resolveAccountStatus(Number(row.balance), row.dueDate, Number(row.amount)) };
    });

    return {
      summary: {
        overdue: agenda.filter((item: any) => item.bucket === "overdue").length,
        due7d: agenda.filter((item: any) => item.bucket === "due_7d").length,
        due30d: agenda.filter((item: any) => item.bucket === "due_30d").length,
      },
      agenda,
    };
  }
}

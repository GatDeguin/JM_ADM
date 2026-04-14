import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionAccountsReceivableInput, CreateAccountsReceivableInput, AccountsReceivableDto, UpdateAccountsReceivableInput } from "../domain/receivables.types";

@Injectable()
export class ReceivablesRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<AccountsReceivableDto[]> { return this.prisma.accountsReceivable.findMany({ orderBy: { id: "desc" } }) as Promise<AccountsReceivableDto[]>; }
  get(id: string): Promise<AccountsReceivableDto> { return this.prisma.accountsReceivable.findUniqueOrThrow({ where: { id } }) as Promise<AccountsReceivableDto>; }
  create(data: CreateAccountsReceivableInput): Promise<AccountsReceivableDto> { return this.prisma.accountsReceivable.create({ data: data as any }) as Promise<AccountsReceivableDto>; }
  update(id: string, data: UpdateAccountsReceivableInput): Promise<AccountsReceivableDto> { return this.prisma.accountsReceivable.update({ where: { id }, data: data as any }) as Promise<AccountsReceivableDto>; }
  remove(id: string) { return this.prisma.accountsReceivable.delete({ where: { id } }); }

  runAction(id: string, payload: ActionAccountsReceivableInput): Promise<AccountsReceivableDto> {
    return this.prisma.$transaction(async (tx: any) => {
      const receivable = await tx.accountsReceivable.findUniqueOrThrow({ where: { id } });
      const receipt = await tx.receipt.create({ data: { code: payload.code, customerId: receivable.customerId, cashAccountId: payload.cashAccountId, amount: payload.amount } });
      await tx.receiptAllocation.create({ data: { receiptId: receipt.id, receivableId: receivable.id, amount: payload.amount } });
      return tx.accountsReceivable.update({ where: { id }, data: { balance: { decrement: payload.amount as never }, status: "partial" } }) as Promise<AccountsReceivableDto>;
    });
  }
}

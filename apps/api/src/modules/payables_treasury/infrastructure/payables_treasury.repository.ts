import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionAccountsPayableInput, CreateAccountsPayableInput, AccountsPayableDto, UpdateAccountsPayableInput } from "../domain/payables_treasury.types";

@Injectable()
export class PayablesTreasuryRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<AccountsPayableDto[]> { return this.prisma.accountsPayable.findMany({ orderBy: { id: "desc" } }) as Promise<AccountsPayableDto[]>; }
  get(id: string): Promise<AccountsPayableDto> { return this.prisma.accountsPayable.findUniqueOrThrow({ where: { id } }) as Promise<AccountsPayableDto>; }
  create(data: CreateAccountsPayableInput): Promise<AccountsPayableDto> { return this.prisma.accountsPayable.create({ data: data as any }) as Promise<AccountsPayableDto>; }
  update(id: string, data: UpdateAccountsPayableInput): Promise<AccountsPayableDto> { return this.prisma.accountsPayable.update({ where: { id }, data: data as any }) as Promise<AccountsPayableDto>; }
  remove(id: string) { return this.prisma.accountsPayable.delete({ where: { id } }); }

  runAction(id: string, payload: ActionAccountsPayableInput): Promise<AccountsPayableDto> {
    return this.prisma.$transaction(async (tx: any) => {
      const payable = await tx.accountsPayable.findUniqueOrThrow({ where: { id } });
      const payment = await tx.payment.create({ data: { code: payload.code, supplierId: payable.supplierId, cashAccountId: payload.cashAccountId, amount: payload.amount } });
      await tx.paymentAllocation.create({ data: { paymentId: payment.id, payableId: payable.id, amount: payload.amount } });
      await tx.treasuryMovement.create({ data: { cashAccountId: payload.cashAccountId, type: "outflow", amount: payload.amount, reference: payment.code } });
      return tx.accountsPayable.update({ where: { id }, data: { balance: { decrement: payload.amount as never }, status: "partial" } }) as Promise<AccountsPayableDto>;
    });
  }
}

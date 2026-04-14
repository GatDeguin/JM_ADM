import { Injectable } from "@nestjs/common";
import { PayablesTreasuryRepository } from "../infrastructure/payables_treasury.repository";
import { ActionAccountsPayableInput, CreateAccountsPayableInput, AccountsPayableDto, ReconcileBankInput, TransferFundsInput, UpdateAccountsPayableInput } from "../domain/payables_treasury.types";

@Injectable()
export class PayablesTreasuryService {
  constructor(private readonly repository: PayablesTreasuryRepository) {}

  list(): Promise<AccountsPayableDto[]> { return this.repository.list(); }
  get(id: string): Promise<AccountsPayableDto> { return this.repository.get(id); }
  create(data: CreateAccountsPayableInput): Promise<AccountsPayableDto> { return this.repository.create(data); }
  update(id: string, data: UpdateAccountsPayableInput): Promise<AccountsPayableDto> { return this.repository.update(id, data); }
  remove(id: string) { return this.repository.remove(id); }
  runAction(payload: ActionAccountsPayableInput): Promise<{ paymentId: string; payables: AccountsPayableDto[] }> { return this.repository.runAction(payload); }
  transferFunds(payload: TransferFundsInput) { return this.repository.transferFunds(payload); }
  reconcileBank(payload: ReconcileBankInput) { return this.repository.reconcileBank(payload); }
}

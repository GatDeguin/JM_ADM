import { Injectable } from "@nestjs/common";
import { ReceivablesRepository } from "../infrastructure/receivables.repository";
import { ActionAccountsReceivableInput, CreateAccountsReceivableInput, AccountsReceivableDto, UpdateAccountsReceivableInput } from "../domain/receivables.types";

@Injectable()
export class ReceivablesService {
  constructor(private readonly repository: ReceivablesRepository) {}

  list(): Promise<AccountsReceivableDto[]> { return this.repository.list(); }
  get(id: string): Promise<AccountsReceivableDto> { return this.repository.get(id); }
  create(data: CreateAccountsReceivableInput): Promise<AccountsReceivableDto> { return this.repository.create(data); }
  update(id: string, data: UpdateAccountsReceivableInput): Promise<AccountsReceivableDto> { return this.repository.update(id, data); }
  remove(id: string) { return this.repository.remove(id); }
  runAction(payload: ActionAccountsReceivableInput): Promise<{ receiptId: string; receivables: AccountsReceivableDto[] }> { return this.repository.runAction(payload); }
  agingAgenda() { return this.repository.agingAgenda(); }
}

import { HttpStatus, Injectable } from "@nestjs/common";
import { throwDomainError } from "../../../common/domain-rules/domain-errors";
import { assertPositiveNumber } from "../../../common/domain-rules/shared-domain-rules";
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

  runAction(payload: ActionAccountsPayableInput): Promise<{ paymentId: string; payables: AccountsPayableDto[] }> {
    if (!payload.allocations.length) {
      throwDomainError("RULE_PAYABLES_ALLOCATIONS_REQUIRED", "Debes informar al menos una imputación para registrar el pago.", HttpStatus.BAD_REQUEST, "R-PT-001");
    }
    assertPositiveNumber(payload.amount, "El monto del pago");
    return this.repository.runAction(payload);
  }

  transferFunds(payload: TransferFundsInput) {
    if (payload.fromCashAccountId === payload.toCashAccountId) {
      throwDomainError("RULE_PAYABLES_TRANSFER_DIFFERENT_ACCOUNT", "La transferencia requiere cuentas origen y destino distintas.", HttpStatus.BAD_REQUEST, "R-PT-005");
    }
    return this.repository.transferFunds(payload);
  }

  reconcileBank(payload: ReconcileBankInput) { return this.repository.reconcileBank(payload); }
}

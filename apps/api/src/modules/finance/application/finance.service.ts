import { Injectable } from "@nestjs/common";
import { assertNonZeroNumber, assertRequiredText } from "../../../common/domain-rules/shared-domain-rules";

@Injectable()
export class FinanceService {
  registerInventoryAdjustment(itemId: string, qty: number, reason: string) {
    assertRequiredText(itemId, "el item de stock");
    assertNonZeroNumber(qty, "La cantidad de ajuste");
    assertRequiredText(reason, "el motivo del ajuste");

    return {
      event: "finance.inventory.adjustment.registered",
      itemId,
      qty,
      reason,
    };
  }

  registerTreasuryTransfer(fromCashAccountId: string, toCashAccountId: string, amount: number, reference?: string) {
    assertRequiredText(fromCashAccountId, "la cuenta origen");
    assertRequiredText(toCashAccountId, "la cuenta destino");
    assertNonZeroNumber(amount, "el monto de transferencia");

    return {
      event: "finance.treasury.transfer.registered",
      fromCashAccountId,
      toCashAccountId,
      amount,
      reference: reference ?? "transfer",
    };
  }

  registerBankReconciliation(cashAccountId: string, period: string, status: string) {
    assertRequiredText(cashAccountId, "la cuenta de caja/banco");
    assertRequiredText(period, "el período");
    assertRequiredText(status, "el estado de conciliación");

    return {
      event: "finance.bank.reconciliation.registered",
      cashAccountId,
      period,
      status,
    };
  }

  getCashFlowProjection(period: string) {
    assertRequiredText(period, "el período");

    return {
      event: "finance.cashflow.projection.generated",
      period,
      projectedInflows: 0,
      projectedOutflows: 0,
      netCashFlow: 0,
    };
  }
}

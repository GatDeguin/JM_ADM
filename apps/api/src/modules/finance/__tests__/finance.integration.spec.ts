import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { FinanceService } from "../application/finance.service";
import { FinanceController } from "../presentation/finance.controller";
import { integrationFixtures } from "../../../test-data/integration-fixtures";

describe("finance integration", () => {
  it("bloquea ajustes sin motivo", () => {
    const service = new FinanceService();

    expect(() => service.registerInventoryAdjustment(integrationFixtures.finance.itemId, 3, "")).toThrow(BadRequestException);
  });

  it("acepta ajustes con motivo", () => {
    const service = new FinanceService();

    const result = service.registerInventoryAdjustment(
      integrationFixtures.finance.itemId,
      integrationFixtures.finance.qty,
      integrationFixtures.finance.reason,
    );

    expect(result.event).toBe("finance.inventory.adjustment.registered");
  });

  it("expone endpoints operativos de tesorería, conciliación y flujo de caja", () => {
    const service = new FinanceService();
    const controller = new FinanceController(service);

    const transfer = controller.registerTreasuryTransfer({
      fromCashAccountId: "cash-1",
      toCashAccountId: "cash-2",
      amount: 500,
      reference: "TR-001",
    });
    const reconciliation = controller.registerBankReconciliation({
      cashAccountId: "cash-1",
      period: "2026-04",
      status: "balanced",
    });
    const cashFlow = controller.getCashFlow("2026-04");

    expect(transfer.event).toBe("finance.treasury.transfer.registered");
    expect(reconciliation.event).toBe("finance.bank.reconciliation.registered");
    expect(cashFlow.event).toBe("finance.cashflow.projection.generated");
  });
});

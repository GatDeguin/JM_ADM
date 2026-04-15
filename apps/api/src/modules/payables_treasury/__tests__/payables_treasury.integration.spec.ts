import { describe, expect, it, vi } from "vitest";
import { PayablesTreasuryRepository } from "../infrastructure/payables_treasury.repository";
import { PayablesTreasuryController } from "../presentation/payables_treasury.controller";
import { PayablesTreasuryService } from "../application/payables_treasury.service";

describe("payables treasury transactional integrity", () => {
  it("ejecuta todas las operaciones dentro de una transacción", async () => {
    const tx = {
      accountsPayable: {
        findUniqueOrThrow: vi.fn(async () => ({ id: "ap-1", supplierId: "sup-1" })),
        update: vi.fn(async () => ({ id: "ap-1", status: "partial", balance: 70 })),
      },
      payment: { create: vi.fn(async () => ({ id: "pay-1", code: "P-1" })) },
      paymentAllocation: { create: vi.fn(async () => ({ id: "pa-1" })) },
      treasuryMovement: { create: vi.fn(async () => ({ id: "tm-1" })) },
    };

    const prisma = {
      $transaction: vi.fn(async (cb: (arg: typeof tx) => Promise<unknown>) => cb(tx)),
    };

    const repository = new PayablesTreasuryRepository(prisma as never);
    await repository.runAction({ code: "P-1", cashAccountId: "cash-1", amount: 30, allocations: [{ payableId: "ap-1", amount: 30 }] });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.payment.create).toHaveBeenCalledTimes(1);
    expect(tx.paymentAllocation.create).toHaveBeenCalledTimes(1);
    expect(tx.treasuryMovement.create).toHaveBeenCalledTimes(1);
    expect(tx.accountsPayable.update).toHaveBeenCalledTimes(1);
  });

  it("propaga error y evita update final cuando falla una operación intermedia", async () => {
    const tx = {
      accountsPayable: {
        findUniqueOrThrow: vi.fn(async () => ({ id: "ap-1", supplierId: "sup-1" })),
        update: vi.fn(async () => ({ id: "ap-1", status: "partial", balance: 70 })),
      },
      payment: { create: vi.fn(async () => ({ id: "pay-1", code: "P-1" })) },
      paymentAllocation: { create: vi.fn(async () => { throw new Error("allocation error"); }) },
      treasuryMovement: { create: vi.fn(async () => ({ id: "tm-1" })) },
    };

    const prisma = {
      $transaction: vi.fn(async (cb: (arg: typeof tx) => Promise<unknown>) => cb(tx)),
    };

    const repository = new PayablesTreasuryRepository(prisma as never);

    await expect(repository.runAction({ code: "P-1", cashAccountId: "cash-1", amount: 30, allocations: [{ payableId: "ap-1", amount: 30 }] })).rejects.toThrow("allocation error");
    expect(tx.accountsPayable.update).not.toHaveBeenCalled();
  });

  it("expone aliases transaccionales explícitos para pagos/transferencias/conciliación", async () => {
    const service = {
      runAction: vi.fn(async () => ({ paymentId: "pay-1", payables: [] })),
      transferFunds: vi.fn(async () => ({ event: "finance.treasury.transfer.registered" })),
      reconcileBank: vi.fn(async () => ({ event: "finance.bank.reconciliation.registered" })),
    } as unknown as PayablesTreasuryService;

    const controller = new PayablesTreasuryController(service);

    await controller.registerPayment({ code: "PAY-1", cashAccountId: "cash-1", amount: 100, allocations: [{ payableId: "ap-1", amount: 100 }] });
    await controller.registerTransferFunds({ fromCashAccountId: "cash-1", toCashAccountId: "cash-2", amount: 100 });
    await controller.registerBankReconciliation({ cashAccountId: "cash-1", period: "2026-04", status: "balanced" });

    expect(service.runAction).toHaveBeenCalledTimes(1);
    expect(service.transferFunds).toHaveBeenCalledTimes(1);
    expect(service.reconcileBank).toHaveBeenCalledTimes(1);
  });
});

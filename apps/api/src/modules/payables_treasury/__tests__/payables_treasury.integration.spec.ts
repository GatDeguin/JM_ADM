import { describe, expect, it, vi } from "vitest";
import { PayablesTreasuryRepository } from "../infrastructure/payables_treasury.repository";

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
    await repository.runAction("ap-1", { code: "P-1", cashAccountId: "cash-1", amount: 30 });

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
      paymentAllocation: { create: vi.fn(async () => ({ id: "pa-1" })) },
      treasuryMovement: { create: vi.fn(async () => { throw new Error("outflow error"); }) },
    };

    const prisma = {
      $transaction: vi.fn(async (cb: (arg: typeof tx) => Promise<unknown>) => cb(tx)),
    };

    const repository = new PayablesTreasuryRepository(prisma as never);

    await expect(repository.runAction("ap-1", { code: "P-1", cashAccountId: "cash-1", amount: 30 })).rejects.toThrow("outflow error");
    expect(tx.accountsPayable.update).not.toHaveBeenCalled();
  });
});

import { Body, Controller, Get, Post, Query, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { FinanceService } from "../application/finance.service";

const registerAdjustmentSchema = z.object({
  itemId: z.string().min(1),
  qty: z.number().refine((value) => value !== 0, "qty must be non-zero"),
  reason: z.string().min(3),
});

const registerTreasuryTransferSchema = z.object({
  fromCashAccountId: z.string().min(1),
  toCashAccountId: z.string().min(1),
  amount: z.number().positive(),
  reference: z.string().optional(),
});

const registerBankReconciliationSchema = z.object({
  cashAccountId: z.string().min(1),
  period: z.string().min(4),
  status: z.string().min(3),
});

@Controller("finance")
export class FinanceController {
  constructor(private readonly service: FinanceService) {}

  @Post("adjustments/register")
  @UsePipes(new ZodValidationPipe(registerAdjustmentSchema))
  registerInventoryAdjustment(@Body() body: z.infer<typeof registerAdjustmentSchema>) {
    return this.service.registerInventoryAdjustment(body.itemId, body.qty, body.reason);
  }

  @Post("treasury/transfers/register")
  @UsePipes(new ZodValidationPipe(registerTreasuryTransferSchema))
  registerTreasuryTransfer(@Body() body: z.infer<typeof registerTreasuryTransferSchema>) {
    return this.service.registerTreasuryTransfer(body.fromCashAccountId, body.toCashAccountId, body.amount, body.reference);
  }

  @Post("bank-reconciliation/register")
  @UsePipes(new ZodValidationPipe(registerBankReconciliationSchema))
  registerBankReconciliation(@Body() body: z.infer<typeof registerBankReconciliationSchema>) {
    return this.service.registerBankReconciliation(body.cashAccountId, body.period, body.status);
  }

  @Get("cash-flow")
  getCashFlow(@Query("period") period: string) {
    return this.service.getCashFlowProjection(period);
  }
}

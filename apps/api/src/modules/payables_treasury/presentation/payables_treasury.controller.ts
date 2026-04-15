import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { PayablesTreasuryService } from "../application/payables_treasury.service";
import { applyPaymentSchema, ApplyPaymentDto, createPayableSchema, CreatePayableDto, reconcileBankSchema, ReconcileBankDto, transferFundsSchema, TransferFundsDto, updatePayableSchema, UpdatePayableDto } from "./payables_treasury.dto";

@Controller("payables_treasury")
export class PayablesTreasuryController {
  constructor(private readonly service: PayablesTreasuryService) {}

  @Get("accounts-payable")
  list() { return this.service.list(); }

  @Get("accounts-payable/:id")
  get(@Param("id") id: string) { return this.service.get(id); }

  @Post("accounts-payable")
  @UsePipes(new ZodValidationPipe(createPayableSchema))
  create(@Body() body: CreatePayableDto) { return this.service.create(body); }

  @Patch("accounts-payable/:id")
  @UsePipes(new ZodValidationPipe(updatePayableSchema))
  update(@Param("id") id: string, @Body() body: UpdatePayableDto) { return this.service.update(id, body); }

  @Delete("accounts-payable/:id")
  remove(@Param("id") id: string) { return this.service.remove(id); }

  @Post("payments/apply")
  @UsePipes(new ZodValidationPipe(applyPaymentSchema))
  runAction(@Body() payload: ApplyPaymentDto) { return this.service.runAction(payload); }

  @Post("payments/register")
  @UsePipes(new ZodValidationPipe(applyPaymentSchema))
  registerPayment(@Body() payload: ApplyPaymentDto) { return this.service.runAction(payload); }

  @Post("treasury/transfers")
  @UsePipes(new ZodValidationPipe(transferFundsSchema))
  transferFunds(@Body() payload: TransferFundsDto) { return this.service.transferFunds(payload); }

  @Post("treasury/transfers/register")
  @UsePipes(new ZodValidationPipe(transferFundsSchema))
  registerTransferFunds(@Body() payload: TransferFundsDto) { return this.service.transferFunds(payload); }

  @Post("bank-reconciliation")
  @UsePipes(new ZodValidationPipe(reconcileBankSchema))
  reconcileBank(@Body() payload: ReconcileBankDto) { return this.service.reconcileBank(payload); }

  @Post("bank-reconciliations/register")
  @UsePipes(new ZodValidationPipe(reconcileBankSchema))
  registerBankReconciliation(@Body() payload: ReconcileBankDto) { return this.service.reconcileBank(payload); }
}

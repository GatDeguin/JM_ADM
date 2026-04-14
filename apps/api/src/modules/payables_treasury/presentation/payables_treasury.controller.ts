import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { PayablesTreasuryService } from "../application/payables_treasury.service";

const createSchema = z.object({ supplierId: z.string().min(1), sourceType: z.string().min(1), sourceId: z.string().min(1), dueDate: z.string().datetime(), amount: z.number().positive() });
const updateSchema = z.object({ status: z.enum(["open", "partial", "paid", "overdue", "cancelled"]).optional() });
const actionSchema = z.object({
  code: z.string().min(2),
  cashAccountId: z.string().min(1),
  amount: z.number().positive(),
  allocations: z.array(z.object({ payableId: z.string().min(1), amount: z.number().positive() })).min(1),
});
const transferSchema = z.object({ fromCashAccountId: z.string().min(1), toCashAccountId: z.string().min(1), amount: z.number().positive(), reference: z.string().optional() });
const reconcileSchema = z.object({ cashAccountId: z.string().min(1), period: z.string().min(4), status: z.string().min(3) });

@Controller("payables_treasury")
export class PayablesTreasuryController {
  constructor(private readonly service: PayablesTreasuryService) {}

  @Get("accounts-payable")
  list() {
    return this.service.list();
  }

  @Get("accounts-payable/:id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @Post("accounts-payable")
  @UsePipes(new ZodValidationPipe(createSchema))
  create(@Body() body: z.infer<typeof createSchema>) {
    return this.service.create(body);
  }

  @Patch("accounts-payable/:id")
  @UsePipes(new ZodValidationPipe(updateSchema))
  update(@Param("id") id: string, @Body() body: z.infer<typeof updateSchema>) {
    return this.service.update(id, body);
  }

  @Delete("accounts-payable/:id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }

  @Post("payments/apply")
  @UsePipes(new ZodValidationPipe(actionSchema))
  runAction(@Body() payload: z.infer<typeof actionSchema>) {
    return this.service.runAction(payload);
  }

  @Post("treasury/transfers")
  @UsePipes(new ZodValidationPipe(transferSchema))
  transferFunds(@Body() payload: z.infer<typeof transferSchema>) {
    return this.service.transferFunds(payload);
  }

  @Post("bank-reconciliation")
  @UsePipes(new ZodValidationPipe(reconcileSchema))
  reconcileBank(@Body() payload: z.infer<typeof reconcileSchema>) {
    return this.service.reconcileBank(payload);
  }
}

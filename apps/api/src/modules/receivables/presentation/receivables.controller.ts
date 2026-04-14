import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { ReceivablesService } from "../application/receivables.service";

const createSchema = z.object({ customerId: z.string().min(1), salesOrderId: z.string().min(1), dueDate: z.string().datetime(), amount: z.number().positive() });
const updateSchema = z.object({ status: z.enum(["open", "partial", "paid", "overdue", "cancelled"]).optional() });
const actionSchema = z.object({
  code: z.string().min(2),
  cashAccountId: z.string().min(1),
  amount: z.number().positive(),
  allocations: z.array(z.object({ receivableId: z.string().min(1), amount: z.number().positive() })).min(1),
});

@Controller("receivables")
export class ReceivablesController {
  constructor(private readonly service: ReceivablesService) {}

  @Get("accounts-receivable")
  list() {
    return this.service.list();
  }

  @Get("accounts-receivable/aging-agenda")
  agingAgenda() {
    return this.service.agingAgenda();
  }

  @Get("accounts-receivable/:id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @Post("accounts-receivable")
  @UsePipes(new ZodValidationPipe(createSchema))
  create(@Body() body: z.infer<typeof createSchema>) {
    return this.service.create(body);
  }

  @Patch("accounts-receivable/:id")
  @UsePipes(new ZodValidationPipe(updateSchema))
  update(@Param("id") id: string, @Body() body: z.infer<typeof updateSchema>) {
    return this.service.update(id, body);
  }

  @Delete("accounts-receivable/:id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }

  @Post("receipts/apply")
  @UsePipes(new ZodValidationPipe(actionSchema))
  runAction(@Body() payload: z.infer<typeof actionSchema>) {
    return this.service.runAction(payload);
  }
}

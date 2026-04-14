import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { ExpensesService } from "../application/expenses.service";

const createSchema = z.object({ amount: z.number().positive(), categoryId: z.string().optional(), supplierId: z.string().optional() });
const updateSchema = z.object({ amount: z.number().positive().optional(), status: z.enum(["open", "partial", "paid", "overdue", "cancelled"]).optional() });
const actionSchema = z.object({});

@Controller("expenses")
export class ExpensesController {
  constructor(private readonly service: ExpensesService) {}

  @Get("expenses")
  list() {
    return this.service.list();
  }

  @Get("expenses/:id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @Post("expenses")
  @UsePipes(new ZodValidationPipe(createSchema))
  create(@Body() body: z.infer<typeof createSchema>) {
    return this.service.create(body);
  }

  @Patch("expenses/:id")
  @UsePipes(new ZodValidationPipe(updateSchema))
  update(@Param("id") id: string, @Body() body: z.infer<typeof updateSchema>) {
    return this.service.update(id, body);
  }

  @Delete("expenses/:id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }

  @Post("expenses/:id/action")
  @UsePipes(new ZodValidationPipe(actionSchema))
  runAction(@Param("id") id: string, @Body() payload: z.infer<typeof actionSchema>) {
    return this.service.runAction(id, payload);
  }
}

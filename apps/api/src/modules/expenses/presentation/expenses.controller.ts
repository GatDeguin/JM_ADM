import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { ExpensesService } from "../application/expenses.service";
import { createExpenseSchema, CreateExpenseDto, expenseActionSchema, ExpenseActionDto, updateExpenseSchema, UpdateExpenseDto } from "./expenses.dto";

@Controller("expenses")
export class ExpensesController {
  constructor(private readonly service: ExpensesService) {}

  @Get("")
  list() { return this.service.list(); }

  @Get(":id")
  get(@Param("id") id: string) { return this.service.get(id); }

  @Post("")
  @UsePipes(new ZodValidationPipe(createExpenseSchema))
  create(@Body() body: CreateExpenseDto) { return this.service.create(body); }

  @Patch(":id")
  @UsePipes(new ZodValidationPipe(updateExpenseSchema))
  update(@Param("id") id: string, @Body() body: UpdateExpenseDto) { return this.service.update(id, body); }

  @Delete(":id")
  remove(@Param("id") id: string) { return this.service.remove(id); }

  @Post(":id/action")
  @UsePipes(new ZodValidationPipe(expenseActionSchema))
  runAction(@Param("id") id: string, @Body() payload: ExpenseActionDto) { return this.service.runAction(id, payload); }
}

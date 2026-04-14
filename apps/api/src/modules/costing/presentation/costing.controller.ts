import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { CostingService } from "../application/costing.service";
import { createMonthlyCloseSchema, CreateMonthlyCloseDto, monthlyCloseActionSchema, MonthlyCloseActionDto, updateMonthlyCloseSchema, UpdateMonthlyCloseDto } from "./costing.dto";

@Controller("costing")
export class CostingController {
  constructor(private readonly service: CostingService) {}

  @Get("monthly-closes")
  list() { return this.service.list(); }

  @Get("monthly-closes/:id")
  get(@Param("id") id: string) { return this.service.get(id); }

  @Post("monthly-closes")
  @UsePipes(new ZodValidationPipe(createMonthlyCloseSchema))
  create(@Body() body: CreateMonthlyCloseDto) { return this.service.create(body); }

  @Patch("monthly-closes/:id")
  @UsePipes(new ZodValidationPipe(updateMonthlyCloseSchema))
  update(@Param("id") id: string, @Body() body: UpdateMonthlyCloseDto) { return this.service.update(id, body); }

  @Delete("monthly-closes/:id")
  remove(@Param("id") id: string) { return this.service.remove(id); }

  @Post("monthly-closes/:id/action")
  @UsePipes(new ZodValidationPipe(monthlyCloseActionSchema))
  runAction(@Param("id") id: string, @Body() payload: MonthlyCloseActionDto) { return this.service.runAction(id, payload); }
}

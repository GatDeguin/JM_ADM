import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { ReceivablesService } from "../application/receivables.service";
import { applyReceiptSchema, ApplyReceiptDto, createReceivableSchema, CreateReceivableDto, updateReceivableSchema, UpdateReceivableDto } from "./receivables.dto";

@Controller("receivables")
export class ReceivablesController {
  constructor(private readonly service: ReceivablesService) {}

  @Get("accounts-receivable")
  list() { return this.service.list(); }

  @Get("accounts-receivable/aging-agenda")
  agingAgenda() { return this.service.agingAgenda(); }

  @Get("accounts-receivable/:id")
  get(@Param("id") id: string) { return this.service.get(id); }

  @Post("accounts-receivable")
  @UsePipes(new ZodValidationPipe(createReceivableSchema))
  create(@Body() body: CreateReceivableDto) { return this.service.create(body); }

  @Patch("accounts-receivable/:id")
  @UsePipes(new ZodValidationPipe(updateReceivableSchema))
  update(@Param("id") id: string, @Body() body: UpdateReceivableDto) { return this.service.update(id, body); }

  @Delete("accounts-receivable/:id")
  remove(@Param("id") id: string) { return this.service.remove(id); }

  @Post("receipts/apply")
  @UsePipes(new ZodValidationPipe(applyReceiptSchema))
  runAction(@Body() payload: ApplyReceiptDto) { return this.service.runAction(payload); }
}

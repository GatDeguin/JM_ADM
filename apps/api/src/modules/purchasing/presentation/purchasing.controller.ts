import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { PurchasingService } from "../application/purchasing.service";

const createSchema = z.object({ code: z.string().min(2), supplierId: z.string().min(1), status: z.string().default("draft") });
const updateSchema = z.object({ status: z.string().optional() });
const actionSchema = z.object({});

@Controller("purchasing")
export class PurchasingController {
  constructor(private readonly service: PurchasingService) {}

  @Get("purchase-orders")
  list() {
    return this.service.list();
  }

  @Get("purchase-orders/:id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @Post("purchase-orders")
  @UsePipes(new ZodValidationPipe(createSchema))
  create(@Body() body: z.infer<typeof createSchema>) {
    return this.service.create(body);
  }

  @Patch("purchase-orders/:id")
  @UsePipes(new ZodValidationPipe(updateSchema))
  update(@Param("id") id: string, @Body() body: z.infer<typeof updateSchema>) {
    return this.service.update(id, body);
  }

  @Delete("purchase-orders/:id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }

  @Post("purchase-orders/:id/action")
  @UsePipes(new ZodValidationPipe(actionSchema))
  runAction(@Param("id") id: string, @Body() payload: z.infer<typeof actionSchema>) {
    return this.service.runAction(id, payload);
  }
}

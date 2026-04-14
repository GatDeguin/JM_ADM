import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { PurchasingService } from "../application/purchasing.service";
import { createPurchaseOrderSchema, CreatePurchaseOrderDto, purchaseOrderActionSchema, PurchaseOrderActionDto, updatePurchaseOrderSchema, UpdatePurchaseOrderDto } from "./purchasing.dto";

@Controller("purchasing")
export class PurchasingController {
  constructor(private readonly service: PurchasingService) {}

  @Get("purchase-orders")
  list() { return this.service.list(); }

  @Get("purchase-orders/:id")
  get(@Param("id") id: string) { return this.service.get(id); }

  @Post("purchase-orders")
  @UsePipes(new ZodValidationPipe(createPurchaseOrderSchema))
  create(@Body() body: CreatePurchaseOrderDto) { return this.service.create(body); }

  @Patch("purchase-orders/:id")
  @UsePipes(new ZodValidationPipe(updatePurchaseOrderSchema))
  update(@Param("id") id: string, @Body() body: UpdatePurchaseOrderDto) { return this.service.update(id, body); }

  @Delete("purchase-orders/:id")
  remove(@Param("id") id: string) { return this.service.remove(id); }

  @Post("purchase-orders/:id/action")
  @UsePipes(new ZodValidationPipe(purchaseOrderActionSchema))
  runAction(@Param("id") id: string, @Body() payload: PurchaseOrderActionDto) { return this.service.runAction(id, payload); }
}

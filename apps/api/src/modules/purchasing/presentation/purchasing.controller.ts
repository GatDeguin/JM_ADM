import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { PurchasingService } from "../application/purchasing.service";
import {
  createGoodsReceiptSchema,
  CreateGoodsReceiptDto,
  createPurchaseOrderSchema,
  CreatePurchaseOrderDto,
  createPurchaseRequestSchema,
  CreatePurchaseRequestDto,
  purchaseOrderActionSchema,
  PurchaseOrderActionDto,
  updatePurchaseOrderSchema,
  UpdatePurchaseOrderDto,
  updatePurchaseRequestSchema,
  UpdatePurchaseRequestDto,
} from "./purchasing.dto";

@Controller("purchasing")
export class PurchasingController {
  constructor(private readonly service: PurchasingService) {}

  @Get("purchase-requests")
  listRequests() { return this.service.listRequests(); }

  @Get("purchase-requests/:id")
  getRequest(@Param("id") id: string) { return this.service.getRequest(id); }

  @Post("purchase-requests")
  @UsePipes(new ZodValidationPipe(createPurchaseRequestSchema))
  createRequest(@Body() body: CreatePurchaseRequestDto) { return this.service.createRequest(body); }

  @Patch("purchase-requests/:id")
  @UsePipes(new ZodValidationPipe(updatePurchaseRequestSchema))
  updateRequest(@Param("id") id: string, @Body() body: UpdatePurchaseRequestDto) { return this.service.updateRequest(id, body); }

  @Post("purchase-requests/:id/approve")
  approveRequest(@Param("id") id: string) { return this.service.approveRequest(id); }

  @Get("purchase-orders")
  listOrders() { return this.service.listOrders(); }

  @Get("purchase-orders/:id")
  getOrder(@Param("id") id: string) { return this.service.getOrder(id); }

  @Post("purchase-orders")
  @UsePipes(new ZodValidationPipe(createPurchaseOrderSchema))
  createOrder(@Body() body: CreatePurchaseOrderDto) { return this.service.createOrder(body); }

  @Patch("purchase-orders/:id")
  @UsePipes(new ZodValidationPipe(updatePurchaseOrderSchema))
  updateOrder(@Param("id") id: string, @Body() body: UpdatePurchaseOrderDto) { return this.service.updateOrder(id, body); }

  @Delete("purchase-orders/:id")
  removeOrder(@Param("id") id: string) { return this.service.removeOrder(id); }

  @Post("purchase-orders/:id/action")
  @UsePipes(new ZodValidationPipe(purchaseOrderActionSchema))
  runOrderAction(@Param("id") id: string, @Body() payload: PurchaseOrderActionDto) { return this.service.runOrderAction(id, payload); }

  @Get("goods-receipts")
  listReceipts() { return this.service.listReceipts(); }

  @Get("goods-receipts/:id")
  getReceipt(@Param("id") id: string) { return this.service.getReceipt(id); }

  @Post("goods-receipts")
  @UsePipes(new ZodValidationPipe(createGoodsReceiptSchema))
  createReceipt(@Body() body: CreateGoodsReceiptDto) { return this.service.createReceipt(body); }
}

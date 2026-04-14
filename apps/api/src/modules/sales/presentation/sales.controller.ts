import { Body, Controller, Get, Post, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { SalesService } from "../application/sales.service";

const createSalesOrderSchema = z.object({
  code: z.string().min(2),
  customerId: z.string().min(1),
  priceListId: z.string().min(1),
  total: z.number().positive(),
  items: z
    .array(
      z
        .object({
          skuId: z.string().min(1).optional(),
          comboId: z.string().min(1).optional(),
          qty: z.number().positive(),
        })
        .refine((item) => item.skuId || item.comboId, { message: "Cada ítem requiere skuId o comboId" }),
    )
    .min(1),
});

const createDispatchSchema = z.object({
  code: z.string().min(2),
  salesOrderId: z.string().min(1),
  items: z.array(z.object({ skuId: z.string().min(1), qty: z.number().positive() })).min(1),
});

const createReturnSchema = z.object({
  code: z.string().min(2),
  salesOrderId: z.string().min(1),
  reason: z.string().min(3),
});

@Controller("sales")
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get("sales-orders")
  list() {
    return this.salesService.list();
  }

  @Post("sales-orders")
  @UsePipes(new ZodValidationPipe(createSalesOrderSchema))
  create(@Body() body: z.infer<typeof createSalesOrderSchema>) {
    return this.salesService.create(body.code, body.customerId, body.priceListId, body.total, body.items);
  }

  @Post("dispatch-orders")
  @UsePipes(new ZodValidationPipe(createDispatchSchema))
  dispatch(@Body() body: z.infer<typeof createDispatchSchema>) {
    return this.salesService.dispatch(body);
  }

  @Post("sales-returns")
  @UsePipes(new ZodValidationPipe(createReturnSchema))
  registerReturn(@Body() body: z.infer<typeof createReturnSchema>) {
    return this.salesService.registerReturn(body);
  }
}

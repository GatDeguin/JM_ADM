import { Body, Controller, Get, Param, Post, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { ProductionService } from "../application/production.service";

const createOrderSchema = z.object({
  code: z.string().min(2),
  productBaseId: z.string().min(1),
  formulaVersionId: z.string().min(1),
  plannedQty: z.number().positive(),
});

const closeBatchSchema = z.object({
  responsible: z.string().min(1),
  consumptions: z.array(z.object({ itemId: z.string().min(1), plannedQty: z.number().positive(), actualQty: z.number().positive() })).default([]),
  wastes: z.array(z.object({ reason: z.string().min(1), qty: z.number().positive() })).default([]),
  outputs: z.array(z.object({ itemId: z.string().min(1), qty: z.number().positive() })).min(1),
});

const fractionateSchema = z.object({
  skuId: z.string().min(1),
  qty: z.number().positive(),
  childLots: z.array(z.object({ lotCode: z.string().min(2), qty: z.number().positive() })).min(1),
});

@Controller("production")
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get("production-orders")
  list() {
    return this.productionService.list();
  }

  @Post("production-orders")
  @UsePipes(new ZodValidationPipe(createOrderSchema))
  create(@Body() body: z.infer<typeof createOrderSchema>) {
    return this.productionService.create(body.code, body.productBaseId, body.formulaVersionId, body.plannedQty);
  }

  @Post(":id/reserve-materials")
  reserve(@Param("id") id: string) {
    return this.productionService.reserveMaterials(id);
  }

  @Post(":id/start-batch")
  start(@Param("id") id: string) {
    return this.productionService.start(id);
  }

  @Post(":id/close-batch")
  @UsePipes(new ZodValidationPipe(closeBatchSchema))
  close(@Param("id") id: string, @Body() body: z.infer<typeof closeBatchSchema>) {
    return this.productionService.close(id, body);
  }

  @Post(":id/release-batch")
  release(@Param("id") id: string) {
    return this.productionService.releaseBatch(id);
  }

  @Post(":id/fractionate")
  @UsePipes(new ZodValidationPipe(fractionateSchema))
  fractionate(@Param("id") id: string, @Body() body: z.infer<typeof fractionateSchema>) {
    return this.productionService.fractionate(id, body.qty, body.skuId, body.childLots);
  }

  @Get("batches/:id/timeline")
  timeline(@Param("id") id: string) {
    return this.productionService.traceTimeline(id);
  }
}

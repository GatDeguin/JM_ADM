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
  outputQty: z.number().positive(),
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

  @Post(":id/start-batch")
  start(@Param("id") id: string) {
    return this.productionService.start(id);
  }

  @Post(":id/close-batch")
  @UsePipes(new ZodValidationPipe(closeBatchSchema))
  close(@Param("id") id: string, @Body() body: z.infer<typeof closeBatchSchema>) {
    return this.productionService.close(id, body.responsible, body.outputQty);
  }
}

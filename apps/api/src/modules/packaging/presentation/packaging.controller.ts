import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { PackagingService } from "../application/packaging.service";

const createSchema = z.object({ code: z.string().min(2), parentBatchId: z.string().min(1), skuId: z.string().min(1), qty: z.number().positive() });
const updateSchema = z.object({ qty: z.number().positive().optional(), status: z.string().optional() });
const actionSchema = z.object({});

@Controller("packaging")
export class PackagingController {
  constructor(private readonly service: PackagingService) {}

  @Get("packaging-orders")
  list() {
    return this.service.list();
  }

  @Get("packaging-orders/:id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @Post("packaging-orders")
  @UsePipes(new ZodValidationPipe(createSchema))
  create(@Body() body: z.infer<typeof createSchema>) {
    return this.service.create(body);
  }

  @Patch("packaging-orders/:id")
  @UsePipes(new ZodValidationPipe(updateSchema))
  update(@Param("id") id: string, @Body() body: z.infer<typeof updateSchema>) {
    return this.service.update(id, body);
  }

  @Delete("packaging-orders/:id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }

  @Post("packaging-orders/:id/action")
  @UsePipes(new ZodValidationPipe(actionSchema))
  runAction(@Param("id") id: string, @Body() payload: z.infer<typeof actionSchema>) {
    return this.service.runAction(id, payload);
  }
}

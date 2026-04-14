import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { PricingService } from "../application/pricing.service";

const createSchema = z.object({ code: z.string().min(2), name: z.string().min(2), startsAt: z.string().datetime() });
const updateSchema = z.object({ name: z.string().min(2).optional(), status: z.enum(["draft", "active", "inactive", "pending_homologation", "archived"]).optional() });
const actionSchema = z.object({});

@Controller("pricing")
export class PricingController {
  constructor(private readonly service: PricingService) {}

  @Get("price-lists")
  list() {
    return this.service.list();
  }

  @Get("price-lists/:id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @Post("price-lists")
  @UsePipes(new ZodValidationPipe(createSchema))
  create(@Body() body: z.infer<typeof createSchema>) {
    return this.service.create(body);
  }

  @Patch("price-lists/:id")
  @UsePipes(new ZodValidationPipe(updateSchema))
  update(@Param("id") id: string, @Body() body: z.infer<typeof updateSchema>) {
    return this.service.update(id, body);
  }

  @Delete("price-lists/:id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }

  @Post("price-lists/:id/action")
  @UsePipes(new ZodValidationPipe(actionSchema))
  runAction(@Param("id") id: string, @Body() payload: z.infer<typeof actionSchema>) {
    return this.service.runAction(id, payload);
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { CostingService } from "../application/costing.service";

const createSchema = z.object({ month: z.string().regex(/^\d{4}-\d{2}$/), status: z.string().default("open") });
const updateSchema = z.object({ status: z.string().min(1) });
const actionSchema = z.object({});

@Controller("costing")
export class CostingController {
  constructor(private readonly service: CostingService) {}

  @Get("monthly-closes")
  list() {
    return this.service.list();
  }

  @Get("monthly-closes/:id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @Post("monthly-closes")
  @UsePipes(new ZodValidationPipe(createSchema))
  create(@Body() body: z.infer<typeof createSchema>) {
    return this.service.create(body);
  }

  @Patch("monthly-closes/:id")
  @UsePipes(new ZodValidationPipe(updateSchema))
  update(@Param("id") id: string, @Body() body: z.infer<typeof updateSchema>) {
    return this.service.update(id, body);
  }

  @Delete("monthly-closes/:id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }

  @Post("monthly-closes/:id/action")
  @UsePipes(new ZodValidationPipe(actionSchema))
  runAction(@Param("id") id: string, @Body() payload: z.infer<typeof actionSchema>) {
    return this.service.runAction(id, payload);
  }
}

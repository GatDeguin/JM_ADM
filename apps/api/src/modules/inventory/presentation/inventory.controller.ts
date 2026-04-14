import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { InventoryService } from "../application/inventory.service";

const createSchema = z.object({ itemId: z.string().min(1), qty: z.number().refine((v) => v !== 0), reason: z.string().min(3) });
const updateSchema = z.object({ reason: z.string().min(3).optional() });
const actionSchema = z.object({ reason: z.string().min(3) });

@Controller("inventory")
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get("inventory-adjustments")
  list() {
    return this.service.list();
  }

  @Get("inventory-adjustments/:id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @Post("inventory-adjustments")
  @UsePipes(new ZodValidationPipe(createSchema))
  create(@Body() body: z.infer<typeof createSchema>) {
    return this.service.create(body);
  }

  @Patch("inventory-adjustments/:id")
  @UsePipes(new ZodValidationPipe(updateSchema))
  update(@Param("id") id: string, @Body() body: z.infer<typeof updateSchema>) {
    return this.service.update(id, body);
  }

  @Delete("inventory-adjustments/:id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }

  @Post("inventory-adjustments/:id/action")
  @UsePipes(new ZodValidationPipe(actionSchema))
  runAction(@Param("id") id: string, @Body() payload: z.infer<typeof actionSchema>) {
    return this.service.runAction(id, payload);
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { InventoryService } from "../application/inventory.service";
import { createInventoryAdjustmentSchema, CreateInventoryAdjustmentDto, inventoryAdjustmentActionSchema, InventoryAdjustmentActionDto, updateInventoryAdjustmentSchema, UpdateInventoryAdjustmentDto } from "./inventory.dto";

@Controller("inventory")
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get("inventory-adjustments")
  list() { return this.service.list(); }

  @Get("inventory-adjustments/:id")
  get(@Param("id") id: string) { return this.service.get(id); }

  @Post("inventory-adjustments")
  @UsePipes(new ZodValidationPipe(createInventoryAdjustmentSchema))
  create(@Body() body: CreateInventoryAdjustmentDto) { return this.service.create(body); }

  @Patch("inventory-adjustments/:id")
  @UsePipes(new ZodValidationPipe(updateInventoryAdjustmentSchema))
  update(@Param("id") id: string, @Body() body: UpdateInventoryAdjustmentDto) { return this.service.update(id, body); }

  @Delete("inventory-adjustments/:id")
  remove(@Param("id") id: string) { return this.service.remove(id); }

  @Post("inventory-adjustments/:id/action")
  @UsePipes(new ZodValidationPipe(inventoryAdjustmentActionSchema))
  runAction(@Param("id") id: string, @Body() payload: InventoryAdjustmentActionDto) { return this.service.runAction(id, payload); }
}

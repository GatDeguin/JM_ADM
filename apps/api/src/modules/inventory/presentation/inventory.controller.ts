import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { InventoryService } from "../application/inventory.service";
import {
  createCountSchema,
  CreateCountDto,
  createInternalTransferSchema,
  CreateInternalTransferDto,
  createInventoryAdjustmentSchema,
  CreateInventoryAdjustmentDto,
  inventoryAdjustmentActionSchema,
  InventoryAdjustmentActionDto,
  movementTraceabilityQuerySchema,
  MovementTraceabilityQueryDto,
  updateInventoryAdjustmentSchema,
  UpdateInventoryAdjustmentDto,
} from "./inventory.dto";

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

  @Get("balances")
  getBalances(@Query("itemId") itemId?: string, @Query("warehouseId") warehouseId?: string, @Query("locationId") locationId?: string) {
    return this.service.getBalances({ itemId, warehouseId, locationId });
  }

  @Get("stock-availability")
  getStockAvailability(@Query("itemId") itemId?: string) { return this.service.getStockAvailability(itemId); }

  @Post("internal-transfers")
  @UsePipes(new ZodValidationPipe(createInternalTransferSchema))
  createInternalTransfer(@Body() payload: CreateInternalTransferDto) { return this.service.createInternalTransfer(payload); }

  @Post("transfers/register")
  @UsePipes(new ZodValidationPipe(createInternalTransferSchema))
  registerTransfer(@Body() payload: CreateInternalTransferDto) { return this.service.createInternalTransfer(payload); }

  @Get("cycle-counts")
  listCycleCounts() { return this.service.listCounts("cycle"); }

  @Get("physical-inventories")
  listPhysicalInventories() { return this.service.listCounts("physical"); }

  @Post("counts")
  @UsePipes(new ZodValidationPipe(createCountSchema))
  createCount(@Body() payload: CreateCountDto) { return this.service.createCount(payload); }

  @Get("movements/traceability")
  @UsePipes(new ZodValidationPipe(movementTraceabilityQuerySchema))
  movementTraceability(@Query() query: MovementTraceabilityQueryDto) { return this.service.getMovementTraceability(query); }
}

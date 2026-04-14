import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { PackagingService } from "../application/packaging.service";
import { createPackagingOrderSchema, CreatePackagingOrderDto, packagingOrderActionSchema, PackagingOrderActionDto, updatePackagingOrderSchema, UpdatePackagingOrderDto } from "./packaging.dto";

@Controller("packaging")
export class PackagingController {
  constructor(private readonly service: PackagingService) {}

  @Get("packaging-orders")
  list() { return this.service.list(); }

  @Get("packaging-orders/:id")
  get(@Param("id") id: string) { return this.service.get(id); }

  @Post("packaging-orders")
  @UsePipes(new ZodValidationPipe(createPackagingOrderSchema))
  create(@Body() body: CreatePackagingOrderDto) { return this.service.create(body); }

  @Patch("packaging-orders/:id")
  @UsePipes(new ZodValidationPipe(updatePackagingOrderSchema))
  update(@Param("id") id: string, @Body() body: UpdatePackagingOrderDto) { return this.service.update(id, body); }

  @Delete("packaging-orders/:id")
  remove(@Param("id") id: string) { return this.service.remove(id); }

  @Post("packaging-orders/:id/action")
  @UsePipes(new ZodValidationPipe(packagingOrderActionSchema))
  runAction(@Param("id") id: string, @Body() payload: PackagingOrderActionDto) { return this.service.runAction(id, payload); }
}

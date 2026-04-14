import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { MastersService } from "../application/masters.service";
import { contextualEntityTypeSchema, createContextualEntitySchema, CreateContextualEntityDto, createUnitSchema, CreateUnitDto, unitActionSchema, UnitActionDto, updateUnitSchema, UpdateUnitDto } from "./masters.dto";

@Controller("masters")
export class MastersController {
  constructor(private readonly service: MastersService) {}

  @Get("units")
  list() { return this.service.list(); }

  @Get("units/:id")
  get(@Param("id") id: string) { return this.service.get(id); }

  @Post("units")
  @UsePipes(new ZodValidationPipe(createUnitSchema))
  create(@Body() body: CreateUnitDto) { return this.service.create(body); }

  @Patch("units/:id")
  @UsePipes(new ZodValidationPipe(updateUnitSchema))
  update(@Param("id") id: string, @Body() body: UpdateUnitDto) { return this.service.update(id, body); }

  @Delete("units/:id")
  remove(@Param("id") id: string) { return this.service.remove(id); }

  @Post("units/:id/action")
  @UsePipes(new ZodValidationPipe(unitActionSchema))
  runAction(@Param("id") id: string, @Body() payload: UnitActionDto) { return this.service.runAction(id, payload); }

  @Get("contextual/entities/:entityType/options")
  listContextualOptions(@Param("entityType") entityType: string) {
    const parsed = contextualEntityTypeSchema.parse(entityType);
    return this.service.listContextualOptions(parsed);
  }

  @Post("contextual/entities/:entityType")
  @UsePipes(new ZodValidationPipe(createContextualEntitySchema))
  createContextualEntity(@Param("entityType") entityType: string, @Body() body: CreateContextualEntityDto) {
    const parsed = contextualEntityTypeSchema.parse(entityType);
    return this.service.createContextualEntity(parsed, body);
  }
}

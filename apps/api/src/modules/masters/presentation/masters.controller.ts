import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { MastersService } from "../application/masters.service";
import { contextualEntityTypes } from "../domain/masters.types";

const createSchema = z.object({ code: z.string().min(1), name: z.string().min(1) });
const updateSchema = z.object({ name: z.string().min(1).optional(), status: z.enum(["draft", "active", "inactive", "pending_homologation", "archived"]).optional() });
const actionSchema = z.object({});
const contextualEntityTypeSchema = z.enum(contextualEntityTypes);
const contextualCreateSchema = z.object({
  label: z.string().min(1),
  meta: z.string().optional(),
  originFlow: z.string().min(1).optional()
});

@Controller("masters")
export class MastersController {
  constructor(private readonly service: MastersService) {}

  @Get("units")
  list() {
    return this.service.list();
  }

  @Get("units/:id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @Post("units")
  @UsePipes(new ZodValidationPipe(createSchema))
  create(@Body() body: z.infer<typeof createSchema>) {
    return this.service.create(body);
  }

  @Patch("units/:id")
  @UsePipes(new ZodValidationPipe(updateSchema))
  update(@Param("id") id: string, @Body() body: z.infer<typeof updateSchema>) {
    return this.service.update(id, body);
  }

  @Delete("units/:id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }

  @Post("units/:id/action")
  @UsePipes(new ZodValidationPipe(actionSchema))
  runAction(@Param("id") id: string, @Body() payload: z.infer<typeof actionSchema>) {
    return this.service.runAction(id, payload);
  }

  @Get("contextual/entities/:entityType/options")
  listContextualOptions(@Param("entityType") entityType: string) {
    const parsed = contextualEntityTypeSchema.parse(entityType);
    return this.service.listContextualOptions(parsed);
  }

  @Post("contextual/entities/:entityType")
  @UsePipes(new ZodValidationPipe(contextualCreateSchema))
  createContextualEntity(@Param("entityType") entityType: string, @Body() body: z.infer<typeof contextualCreateSchema>) {
    const parsed = contextualEntityTypeSchema.parse(entityType);
    return this.service.createContextualEntity(parsed, body);
  }
}

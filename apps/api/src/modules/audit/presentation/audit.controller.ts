import { Body, Controller, Delete, Get, MethodNotAllowedException, Param, Patch, Post, Query, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { AuditService } from "../application/audit.service";

const createSchema = z.object({ entity: z.string().min(1), entityId: z.string().min(1), action: z.string().min(1), origin: z.string().optional(), userId: z.string().optional() });
const updateSchema = z.object({ origin: z.string().optional() });
const actionSchema = z.object({ after: z.record(z.any()) });

@Controller("audit")
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get("audit-logs")
  list(@Query("limit") limit?: string) {
    return this.service.list(limit ? Number(limit) : undefined);
  }

  @Get("audit-logs/timeline/:entity/:entityId")
  timelineByEntity(@Param("entity") entity: string, @Param("entityId") entityId: string, @Query("limit") limit?: string) {
    return this.service.timeline(entity, entityId, limit ? Number(limit) : undefined);
  }

  @Get("audit-logs/:id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @Post("audit-logs")
  @UsePipes(new ZodValidationPipe(createSchema))
  create(@Body() body: z.infer<typeof createSchema>) {
    return this.service.create(body);
  }

  @Patch("audit-logs/:id")
  @UsePipes(new ZodValidationPipe(updateSchema))
  update(@Param("id") id: string, @Body() body: z.infer<typeof updateSchema>) {
    return this.service.update(id, body);
  }

  @Delete("audit-logs/:id")
  remove() {
    throw new MethodNotAllowedException("No se permite eliminación física del historial de auditoría.");
  }

  @Post("audit-logs/:id/action")
  @UsePipes(new ZodValidationPipe(actionSchema))
  runAction(@Param("id") id: string, @Body() payload: z.infer<typeof actionSchema>) {
    return this.service.runAction(id, payload);
  }
}

import { Body, Controller, Delete, Get, MethodNotAllowedException, Param, Patch, Post, Query, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { AuditService } from "../application/audit.service";
import { auditLogActionSchema, AuditLogActionDto, createAuditLogSchema, CreateAuditLogDto, updateAuditLogSchema, UpdateAuditLogDto } from "./audit.dto";

@Controller("audit")
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get("audit-logs")
  list(@Query("limit") limit?: string) { return this.service.list(limit ? Number(limit) : undefined); }

  @Get("audit-logs/timeline/:entity/:entityId")
  timelineByEntity(@Param("entity") entity: string, @Param("entityId") entityId: string, @Query("limit") limit?: string) {
    return this.service.timeline(entity, entityId, limit ? Number(limit) : undefined);
  }

  @Get("audit-logs/:id")
  get(@Param("id") id: string) { return this.service.get(id); }

  @Post("audit-logs")
  @UsePipes(new ZodValidationPipe(createAuditLogSchema))
  create(@Body() body: CreateAuditLogDto) { return this.service.create(body); }

  @Patch("audit-logs/:id")
  @UsePipes(new ZodValidationPipe(updateAuditLogSchema))
  update(@Param("id") id: string, @Body() body: UpdateAuditLogDto) { return this.service.update(id, body); }

  @Delete("audit-logs/:id")
  remove() { throw new MethodNotAllowedException("No se permite eliminación física del historial de auditoría."); }

  @Post("audit-logs/:id/action")
  @UsePipes(new ZodValidationPipe(auditLogActionSchema))
  runAction(@Param("id") id: string, @Body() payload: AuditLogActionDto) { return this.service.runAction(id, payload); }
}

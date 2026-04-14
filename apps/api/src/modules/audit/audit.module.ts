import { Module } from "@nestjs/common";
import { AuditController } from "./presentation/audit.controller";
import { AuditService } from "./application/audit.service";
import { AuditRepository } from "./infrastructure/audit.repository";
import { AuditTrailService } from "./application/audit-trail.service";

@Module({
  controllers: [AuditController],
  providers: [AuditService, AuditRepository, AuditTrailService],
  exports: [AuditTrailService],
})
export class AuditModule {}

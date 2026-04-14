import { Module } from "@nestjs/common";
import { AuditController } from "./presentation/audit.controller";
import { AuditService } from "./application/audit.service";
import { AuditRepository } from "./infrastructure/audit.repository";

@Module({
  controllers: [AuditController],
  providers: [AuditService, AuditRepository],
})
export class AuditModule {}

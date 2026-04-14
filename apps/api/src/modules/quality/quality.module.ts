import { Module } from "@nestjs/common";
import { DomainEventsService } from "../../common/events/domain-events.service";
import { AuditModule } from "../audit/audit.module";
import { QualityService } from "./application/quality.service";
import { QualityRepository } from "./infrastructure/quality.repository";
import { QualityController } from "./presentation/quality.controller";

@Module({
  imports: [AuditModule],
  controllers: [QualityController],
  providers: [QualityService, QualityRepository, DomainEventsService],
})
export class QualityModule {}

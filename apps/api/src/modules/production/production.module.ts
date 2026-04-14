import { Module } from "@nestjs/common";
import { DomainEventsService } from "../../common/events/domain-events.service";
import { AuditModule } from "../audit/audit.module";
import { ProductionService } from "./application/production.service";
import { ProductionRepository } from "./infrastructure/production.repository";
import { ProductionController } from "./presentation/production.controller";

@Module({
  imports: [AuditModule],
  controllers: [ProductionController],
  providers: [ProductionService, ProductionRepository, DomainEventsService],
})
export class ProductionModule {}

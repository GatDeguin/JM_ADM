import { Module } from "@nestjs/common";
import { CostingController } from "./presentation/costing.controller";
import { CostingService } from "./application/costing.service";
import { CostingRepository } from "./infrastructure/costing.repository";
import { DomainEventsService } from "../../common/events/domain-events.service";

@Module({
  controllers: [CostingController],
  providers: [CostingService, CostingRepository, DomainEventsService],
})
export class CostingModule {}

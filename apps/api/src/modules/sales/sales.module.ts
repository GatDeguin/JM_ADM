import { Module } from "@nestjs/common";
import { SalesService } from "./application/sales.service";
import { SalesRepository } from "./infrastructure/sales.repository";
import { SalesController } from "./presentation/sales.controller";
import { DomainEventsService } from "../../common/events/domain-events.service";

@Module({
  controllers: [SalesController],
  providers: [SalesService, SalesRepository, DomainEventsService],
})
export class SalesModule {}

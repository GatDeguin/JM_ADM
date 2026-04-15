import { Module } from "@nestjs/common";
import { PurchasingController } from "./presentation/purchasing.controller";
import { PurchasingService } from "./application/purchasing.service";
import { PurchasingRepository } from "./infrastructure/purchasing.repository";
import { DomainEventsService } from "../../common/events/domain-events.service";

@Module({
  controllers: [PurchasingController],
  providers: [PurchasingService, PurchasingRepository, DomainEventsService],
})
export class PurchasingModule {}

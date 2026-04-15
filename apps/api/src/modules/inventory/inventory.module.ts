import { Module } from "@nestjs/common";
import { InventoryController } from "./presentation/inventory.controller";
import { InventoryService } from "./application/inventory.service";
import { InventoryRepository } from "./infrastructure/inventory.repository";
import { AuditModule } from "../audit/audit.module";
import { DomainEventsService } from "../../common/events/domain-events.service";

@Module({
  imports: [AuditModule],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryRepository, DomainEventsService],
})
export class InventoryModule {}

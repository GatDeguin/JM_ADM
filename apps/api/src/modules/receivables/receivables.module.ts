import { Module } from "@nestjs/common";
import { ReceivablesController } from "./presentation/receivables.controller";
import { ReceivablesService } from "./application/receivables.service";
import { ReceivablesRepository } from "./infrastructure/receivables.repository";
import { DomainEventsService } from "../../common/events/domain-events.service";

@Module({
  controllers: [ReceivablesController],
  providers: [ReceivablesService, ReceivablesRepository, DomainEventsService],
})
export class ReceivablesModule {}

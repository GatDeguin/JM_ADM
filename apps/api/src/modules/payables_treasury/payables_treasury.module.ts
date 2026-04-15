import { Module } from "@nestjs/common";
import { PayablesTreasuryController } from "./presentation/payables_treasury.controller";
import { PayablesTreasuryService } from "./application/payables_treasury.service";
import { PayablesTreasuryRepository } from "./infrastructure/payables_treasury.repository";
import { AuditModule } from "../audit/audit.module";
import { DomainEventsService } from "../../common/events/domain-events.service";

@Module({
  imports: [AuditModule],
  controllers: [PayablesTreasuryController],
  providers: [PayablesTreasuryService, PayablesTreasuryRepository, DomainEventsService],
})
export class PayablesTreasuryModule {}

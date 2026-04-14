import { Module } from "@nestjs/common";
import { PayablesTreasuryController } from "./presentation/payables_treasury.controller";
import { PayablesTreasuryService } from "./application/payables_treasury.service";
import { PayablesTreasuryRepository } from "./infrastructure/payables_treasury.repository";

@Module({
  controllers: [PayablesTreasuryController],
  providers: [PayablesTreasuryService, PayablesTreasuryRepository],
})
export class PayablesTreasuryModule {}

import { Module } from "@nestjs/common";
import { PricingController } from "./presentation/pricing.controller";
import { PricingService } from "./application/pricing.service";
import { PricingRepository } from "./infrastructure/pricing.repository";

@Module({
  controllers: [PricingController],
  providers: [PricingService, PricingRepository],
})
export class PricingModule {}

import { Module } from "@nestjs/common";
import { PurchasingController } from "./presentation/purchasing.controller";
import { PurchasingService } from "./application/purchasing.service";
import { PurchasingRepository } from "./infrastructure/purchasing.repository";

@Module({
  controllers: [PurchasingController],
  providers: [PurchasingService, PurchasingRepository],
})
export class PurchasingModule {}

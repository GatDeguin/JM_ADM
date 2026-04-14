import { Module } from "@nestjs/common";
import { CostingController } from "./presentation/costing.controller";
import { CostingService } from "./application/costing.service";
import { CostingRepository } from "./infrastructure/costing.repository";

@Module({
  controllers: [CostingController],
  providers: [CostingService, CostingRepository],
})
export class CostingModule {}

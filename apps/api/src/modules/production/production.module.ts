import { Module } from "@nestjs/common";
import { ProductionService } from "./application/production.service";
import { ProductionRepository } from "./infrastructure/production.repository";
import { ProductionController } from "./presentation/production.controller";

@Module({
  controllers: [ProductionController],
  providers: [ProductionService, ProductionRepository],
})
export class ProductionModule {}

import { Module } from "@nestjs/common";
import { QualityController } from "./presentation/quality.controller";
import { QualityService } from "./application/quality.service";
import { QualityRepository } from "./infrastructure/quality.repository";

@Module({
  controllers: [QualityController],
  providers: [QualityService, QualityRepository],
})
export class QualityModule {}

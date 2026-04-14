import { Module } from "@nestjs/common";
import { ReportingService } from "./application/reporting.service";
import { ReportingRepository } from "./infrastructure/reporting.repository";
import { ReportingController } from "./presentation/reporting.controller";

@Module({
  controllers: [ReportingController],
  providers: [ReportingService, ReportingRepository],
})
export class ReportingModule {}

import { Controller, Get } from "@nestjs/common";
import { ReportingService } from "../application/reporting.service";

@Controller("reporting")
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get("dashboard")
  dash() {
    return this.reportingService.dashboard();
  }

  @Get("data-quality")
  dq() {
    return this.reportingService.dataQuality();
  }
}

import { Body, Controller, Get, Post, Query, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { ReportingService } from "../application/reporting.service";

const filtersSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  channel: z.string().min(1).optional(),
  line: z.string().min(1).optional(),
  customerId: z.string().min(1).optional(),
});

const snapshotSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/, "Formato esperado YYYY-MM"),
});

@Controller("reporting")
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get("dashboard")
  dash(@Query() query: Record<string, string>) {
    const filters = filtersSchema.parse(query);
    return this.reportingService.dashboard(filters);
  }

  @Get("production")
  production(@Query() query: Record<string, string>) {
    return this.reportingService.production(filtersSchema.parse(query));
  }

  @Get("stock")
  stock(@Query() query: Record<string, string>) {
    return this.reportingService.stock(filtersSchema.parse(query));
  }

  @Get("sales")
  sales(@Query() query: Record<string, string>) {
    return this.reportingService.sales(filtersSchema.parse(query));
  }

  @Get("finance")
  finance(@Query() query: Record<string, string>) {
    return this.reportingService.finance(filtersSchema.parse(query));
  }

  @Get("margins")
  margins(@Query() query: Record<string, string>) {
    return this.reportingService.margins(filtersSchema.parse(query));
  }

  @Get("quality")
  quality(@Query() query: Record<string, string>) {
    return this.reportingService.quality(filtersSchema.parse(query));
  }

  @Get("data-quality")
  dq() {
    return this.reportingService.dataQuality();
  }

  @Get("data-quality/lists")
  dqLists() {
    return this.reportingService.dataQualityLists();
  }

  @Post("snapshots/generate")
  @UsePipes(new ZodValidationPipe(snapshotSchema))
  generateSnapshots(@Body() body: z.infer<typeof snapshotSchema>) {
    return this.reportingService.generateSnapshots(body.period);
  }
}

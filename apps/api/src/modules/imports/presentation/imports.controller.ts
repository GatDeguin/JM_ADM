import { Body, Controller, Get, Param, Post, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { ImportsService } from "../application/imports.service";

const createJobSchema = z.object({
  type: z.string().min(2),
  sourceName: z.string().min(2),
});

const uploadFileSchema = z.object({
  sourceName: z.string().min(2),
  rows: z.array(z.record(z.unknown())),
});

const defineMappingSchema = z.object({
  mapping: z.record(z.string()),
});

@Controller("imports")
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post("jobs")
  @UsePipes(new ZodValidationPipe(createJobSchema))
  createJob(@Body() body: z.infer<typeof createJobSchema>) {
    return this.importsService.createJob(body.type, body.sourceName);
  }

  @Post("jobs/:id/file")
  @UsePipes(new ZodValidationPipe(uploadFileSchema))
  uploadFile(@Param("id") id: string, @Body() body: z.infer<typeof uploadFileSchema>) {
    return this.importsService.uploadFile(id, body.sourceName, body.rows);
  }

  @Post("jobs/:id/mapping")
  @UsePipes(new ZodValidationPipe(defineMappingSchema))
  defineMapping(@Param("id") id: string, @Body() body: z.infer<typeof defineMappingSchema>) {
    return this.importsService.defineMapping(id, body.mapping);
  }

  @Post("jobs/:id/prevalidate")
  prevalidate(@Param("id") id: string) {
    return this.importsService.prevalidate(id);
  }

  @Get("jobs/:id/preview")
  preview(@Param("id") id: string) {
    return this.importsService.preview(id);
  }

  @Post("jobs/:id/confirm")
  confirm(@Param("id") id: string) {
    return this.importsService.confirm(id);
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { QualityService } from "../application/quality.service";
import {
  createQCRecordSchema,
  CreateQCRecordDto,
  qcRecordActionSchema,
  QCProcessDto,
  QCRecordActionDto,
  updateQCRecordSchema,
  UpdateQCRecordDto,
} from "./quality.dto";

@Controller("quality")
export class QualityController {
  constructor(private readonly service: QualityService) {}

  @Get("checklists/by-batch/:batchId")
  getChecklist(@Param("batchId") batchId: string, @Query("process") process?: QCProcessDto, @Query("skuId") skuId?: string) {
    return this.service.getChecklistForBatch(batchId, process ?? "production", skuId);
  }

  @Get("qc-records")
  list() {
    return this.service.list();
  }

  @Get("qc-records/:id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @Post("qc-records")
  @UsePipes(new ZodValidationPipe(createQCRecordSchema))
  create(@Body() body: CreateQCRecordDto) {
    return this.service.create(body);
  }

  @Patch("qc-records/:id")
  @UsePipes(new ZodValidationPipe(updateQCRecordSchema))
  update(@Param("id") id: string, @Body() body: UpdateQCRecordDto) {
    return this.service.update(id, body);
  }

  @Post("qc-records/:id/quality-decision")
  @UsePipes(new ZodValidationPipe(updateQCRecordSchema.required({ decision: true })))
  qualityDecision(@Param("id") id: string, @Body() body: Required<Pick<UpdateQCRecordDto, "decision">> & Pick<UpdateQCRecordDto, "notes">) {
    return this.service.update(id, body);
  }

  @Delete("qc-records/:id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }

  @Post("qc-records/:id/action")
  @UsePipes(new ZodValidationPipe(qcRecordActionSchema))
  runAction(@Param("id") id: string, @Body() payload: QCRecordActionDto) {
    return this.service.runAction(id, payload);
  }
}

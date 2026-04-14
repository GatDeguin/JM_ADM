import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { QualityService } from "../application/quality.service";

const decisionEnum = z.enum(["approved", "rejected", "reprocess"]);

const createSchema = z.object({
  batchId: z.string().min(1),
  decision: decisionEnum,
  notes: z.string().optional(),
  checklistItems: z.array(z.object({ checklistItem: z.string().min(1), passed: z.boolean(), note: z.string().optional() })).min(1),
});
const updateSchema = z.object({ decision: decisionEnum.optional(), notes: z.string().optional() });
const actionSchema = z.object({ severity: z.string().min(1), action: z.string().min(1) });

@Controller("quality")
export class QualityController {
  constructor(private readonly service: QualityService) {}

  @Get("checklists/by-batch/:batchId")
  getChecklist(@Param("batchId") batchId: string) {
    return this.service.getChecklistForBatch(batchId);
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
  @UsePipes(new ZodValidationPipe(createSchema))
  create(@Body() body: z.infer<typeof createSchema>) {
    return this.service.create(body);
  }

  @Patch("qc-records/:id")
  @UsePipes(new ZodValidationPipe(updateSchema))
  update(@Param("id") id: string, @Body() body: z.infer<typeof updateSchema>) {
    return this.service.update(id, body);
  }

  @Delete("qc-records/:id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }

  @Post("qc-records/:id/action")
  @UsePipes(new ZodValidationPipe(actionSchema))
  runAction(@Param("id") id: string, @Body() payload: z.infer<typeof actionSchema>) {
    return this.service.runAction(id, payload);
  }
}

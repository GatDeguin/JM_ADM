import { Body, Controller, Get, Param, Post, Query, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { FormulasService } from "../application/formulas.service";

const createFormulaSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(3),
});

const createVersionSchema = z.object({
  warning: z.string().optional(),
  approvedBy: z.string().min(1).optional(),
  components: z.array(
    z.object({
      itemId: z.string().min(1),
      qty: z.number().positive(),
      unitId: z.string().min(1),
    }),
  ),
  steps: z.array(
    z.object({
      stepNo: z.number().int().positive(),
      instruction: z.string().min(1),
    }),
  ),
});

const obsoleteVersionSchema = z.object({
  versionId: z.string().min(1).optional(),
});

const compareSchema = z.object({
  left: z.string().min(1),
  right: z.string().min(1),
});

@Controller("formulas")
export class FormulasController {
  constructor(private readonly formulasService: FormulasService) {}

  @Get()
  list() {
    return this.formulasService.list();
  }

  @Get("compare")
  @UsePipes(new ZodValidationPipe(compareSchema))
  compare(@Query() query: z.infer<typeof compareSchema>) {
    return this.formulasService.compareVersions(query.left, query.right);
  }

  @Get(":id")
  detail(@Param("id") id: string) {
    return this.formulasService.detail(id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createFormulaSchema))
  create(@Body() body: z.infer<typeof createFormulaSchema>) {
    return this.formulasService.create(body.code, body.name);
  }

  @Post(":id/approve")
  approve(@Param("id") id: string) {
    return this.formulasService.approve(id);
  }

  @Post(":id/version")
  @UsePipes(new ZodValidationPipe(createVersionSchema))
  createVersion(@Param("id") id: string, @Body() body: z.infer<typeof createVersionSchema>) {
    return this.formulasService.createVersion(id, body);
  }

  @Post(":id/obsolete")
  @UsePipes(new ZodValidationPipe(obsoleteVersionSchema))
  obsolete(@Param("id") id: string, @Body() body: z.infer<typeof obsoleteVersionSchema>) {
    return this.formulasService.obsoleteVersion(id, body.versionId);
  }
}

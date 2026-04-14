import { Body, Controller, Get, Param, Post, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { FormulasService } from "../application/formulas.service";

const createFormulaSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(3),
});

@Controller("formulas")
export class FormulasController {
  constructor(private readonly formulasService: FormulasService) {}

  @Get()
  list() {
    return this.formulasService.list();
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
}

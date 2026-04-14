import { Module } from "@nestjs/common";
import { FormulasService } from "./application/formulas.service";
import { FormulasRepository } from "./infrastructure/formulas.repository";
import { FormulasController } from "./presentation/formulas.controller";

@Module({
  controllers: [FormulasController],
  providers: [FormulasService, FormulasRepository],
})
export class FormulasModule {}

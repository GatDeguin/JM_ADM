import { Module } from "@nestjs/common";
import { FormulasService } from "./application/formulas.service";
import { FormulasRepository } from "./infrastructure/formulas.repository";
import { FormulasController } from "./presentation/formulas.controller";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [AuditModule],
  controllers: [FormulasController],
  providers: [FormulasService, FormulasRepository],
})
export class FormulasModule {}

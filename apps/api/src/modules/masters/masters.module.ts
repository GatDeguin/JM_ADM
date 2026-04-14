import { Module } from "@nestjs/common";
import { MastersController } from "./presentation/masters.controller";
import { MastersService } from "./application/masters.service";
import { MastersRepository } from "./infrastructure/masters.repository";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [AuditModule],
  controllers: [MastersController],
  providers: [MastersService, MastersRepository],
})
export class MastersModule {}

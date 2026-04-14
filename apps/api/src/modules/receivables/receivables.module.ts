import { Module } from "@nestjs/common";
import { ReceivablesController } from "./presentation/receivables.controller";
import { ReceivablesService } from "./application/receivables.service";
import { ReceivablesRepository } from "./infrastructure/receivables.repository";

@Module({
  controllers: [ReceivablesController],
  providers: [ReceivablesService, ReceivablesRepository],
})
export class ReceivablesModule {}

import { Module } from "@nestjs/common";
import { SalesService } from "./application/sales.service";
import { SalesRepository } from "./infrastructure/sales.repository";
import { SalesController } from "./presentation/sales.controller";

@Module({
  controllers: [SalesController],
  providers: [SalesService, SalesRepository],
})
export class SalesModule {}

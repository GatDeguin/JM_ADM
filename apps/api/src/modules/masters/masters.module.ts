import { Module } from "@nestjs/common";
import { MastersController } from "./presentation/masters.controller";
import { MastersService } from "./application/masters.service";
import { MastersRepository } from "./infrastructure/masters.repository";

@Module({
  controllers: [MastersController],
  providers: [MastersService, MastersRepository],
})
export class MastersModule {}

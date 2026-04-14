import { Module } from "@nestjs/common";
import { ImportsController } from "./presentation/imports.controller";
import { ImportsService } from "./application/imports.service";
import { ImportsRepository } from "./infrastructure/imports.repository";
import { ImportersService } from "./application/importers.service";
import { ImportQueueService } from "./infrastructure/import-queue.service";
import { ImportProcessorService } from "./application/import-processor.service";
import { ImportEventsService } from "./infrastructure/import-events.service";

@Module({
  controllers: [ImportsController],
  providers: [
    ImportsService,
    ImportsRepository,
    ImportersService,
    ImportQueueService,
    ImportProcessorService,
    ImportEventsService,
  ],
})
export class ImportsModule {}

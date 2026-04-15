import { Module } from "@nestjs/common";
import { PackagingController } from "./presentation/packaging.controller";
import { PackagingService } from "./application/packaging.service";
import { PackagingRepository } from "./infrastructure/packaging.repository";
import { DomainEventsService } from "../../common/events/domain-events.service";

@Module({
  controllers: [PackagingController],
  providers: [PackagingService, PackagingRepository, DomainEventsService],
})
export class PackagingModule {}

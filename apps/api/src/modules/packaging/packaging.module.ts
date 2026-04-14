import { Module } from "@nestjs/common";
import { PackagingController } from "./presentation/packaging.controller";
import { PackagingService } from "./application/packaging.service";
import { PackagingRepository } from "./infrastructure/packaging.repository";

@Module({
  controllers: [PackagingController],
  providers: [PackagingService, PackagingRepository],
})
export class PackagingModule {}

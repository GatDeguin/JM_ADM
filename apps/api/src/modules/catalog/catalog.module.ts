import { Module } from "@nestjs/common";
import { CatalogService } from "./application/catalog.service";
import { CatalogRepository } from "./infrastructure/catalog.repository";
import { CatalogController } from "./presentation/catalog.controller";
import { DomainEventsService } from "../../common/events/domain-events.service";

@Module({
  controllers: [CatalogController],
  providers: [CatalogService, CatalogRepository, DomainEventsService],
})
export class CatalogModule {}

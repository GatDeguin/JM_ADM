import { Module } from "@nestjs/common";
import { CatalogService } from "./application/catalog.service";
import { CatalogRepository } from "./infrastructure/catalog.repository";
import { CatalogController } from "./presentation/catalog.controller";

@Module({
  controllers: [CatalogController],
  providers: [CatalogService, CatalogRepository],
})
export class CatalogModule {}

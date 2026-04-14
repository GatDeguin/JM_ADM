import { ConflictException, Injectable } from "@nestjs/common";
import { CatalogRepository } from "../infrastructure/catalog.repository";

@Injectable()
export class CatalogService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  families() {
    return this.catalogRepository.findFamilies();
  }

  productBases() {
    return this.catalogRepository.findProductBases();
  }

  async createProductBase(code: string, name: string) {
    try {
      return await this.catalogRepository.createProductBase(code, name);
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
        throw new ConflictException("El código de producto base ya existe");
      }
      throw error;
    }
  }

  skus() {
    return this.catalogRepository.findSkus();
  }

  aliases() {
    return this.catalogRepository.findAliases();
  }
}

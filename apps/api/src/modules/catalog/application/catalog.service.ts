import { ConflictException, Injectable } from "@nestjs/common";
import { CatalogRepository } from "../infrastructure/catalog.repository";

@Injectable()
export class CatalogService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  families() {
    return this.catalogRepository.findFamilies();
  }

  createFamily(data: { name: string; status?: "draft" | "active" | "inactive" | "pending_homologation" | "archived" }) {
    return this.handleConflict(() => this.catalogRepository.createFamily(data), "La familia ya existe");
  }

  productBases() {
    return this.catalogRepository.findProductBases();
  }

  createProductBase(data: {
    code: string;
    name: string;
    familyId?: string;
    variantId?: string;
    lineId?: string;
    status?: "draft" | "active" | "inactive" | "pending_homologation" | "archived";
  }) {
    return this.handleConflict(() => this.catalogRepository.createProductBase(data), "El código de producto base ya existe");
  }

  presentations() {
    return this.catalogRepository.findPresentations();
  }

  createPresentation(data: { name: string; unitId?: string; factor?: number; status?: "draft" | "active" | "inactive" | "pending_homologation" | "archived" }) {
    return this.catalogRepository.createPresentation(data);
  }

  skus() {
    return this.catalogRepository.findSkus();
  }

  createSku(data: {
    code: string;
    productBaseId: string;
    presentationId: string;
    barcode?: string;
    status?: "draft" | "active" | "inactive" | "pending_homologation" | "archived";
  }) {
    return this.handleConflict(() => this.catalogRepository.createSku(data), "El código de SKU ya existe");
  }

  packagingSpecs() {
    return this.catalogRepository.findPackagingSpecs();
  }

  createPackagingSpec(data: { skuId: string; componentType: string; itemId: string; qty: number }) {
    return this.handleConflict(
      () => this.catalogRepository.createPackagingSpec(data),
      "La especificación de packaging para ese componente ya existe en el SKU",
    );
  }

  combos() {
    return this.catalogRepository.findCombos();
  }

  createCombo(data: {
    code: string;
    name: string;
    status?: "draft" | "active" | "inactive" | "pending_homologation" | "archived";
    items: Array<{ skuId: string; qty: number }>;
  }) {
    return this.handleConflict(() => this.catalogRepository.createCombo(data), "El código de combo ya existe");
  }

  aliases() {
    return this.catalogRepository.findAliases();
  }

  createAlias(data: {
    entityType: string;
    alias: string;
    canonicalId?: string;
    canonicalName?: string;
    originalValue?: string;
    status?: "draft" | "active" | "inactive" | "pending_homologation" | "archived";
  }) {
    return this.handleConflict(() => this.catalogRepository.createAlias(data), "El alias ya existe para la entidad");
  }

  homologateAlias(data: { entityType: string; alias: string; canonicalId: string; canonicalName: string }) {
    return this.catalogRepository.homologateAlias(data);
  }

  mergeCanonical(data: {
    entityType: "family" | "product_base" | "presentation" | "sku" | "combo";
    sourceId: string;
    targetId: string;
    createSourceAlias?: boolean;
  }) {
    return this.catalogRepository.mergeCanonical(data);
  }

  search(query?: string) {
    return this.catalogRepository.searchCatalog(query ?? "");
  }

  contextualUpsert(data: {
    entityType: "family" | "product_base" | "presentation" | "sku" | "combo" | "alias";
    label: string;
    code?: string;
    originFlow: string;
    context?: Record<string, unknown>;
    status?: "draft" | "active" | "inactive" | "pending_homologation" | "archived";
  }) {
    return this.catalogRepository.contextualUpsert(data);
  }

  private async handleConflict<T>(action: () => Promise<T>, message: string): Promise<T> {
    try {
      return await action();
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
        throw new ConflictException(message);
      }
      throw error;
    }
  }
}

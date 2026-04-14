import { Body, Controller, Get, Post, Query, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { CatalogService } from "../application/catalog.service";

const createFamilySchema = z.object({
  name: z.string().min(2),
  status: z.enum(["draft", "active", "inactive", "pending_homologation", "archived"]).optional(),
});

const createProductBaseSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(3),
  familyId: z.string().optional(),
  variantId: z.string().optional(),
  lineId: z.string().optional(),
  status: z.enum(["draft", "active", "inactive", "pending_homologation", "archived"]).optional(),
});

const createPresentationSchema = z.object({
  name: z.string().min(1),
  unitId: z.string().optional(),
  factor: z.coerce.number().positive().optional(),
  status: z.enum(["draft", "active", "inactive", "pending_homologation", "archived"]).optional(),
});

const createSkuSchema = z.object({
  code: z.string().min(2),
  productBaseId: z.string().min(1),
  presentationId: z.string().min(1),
  barcode: z.string().optional(),
  status: z.enum(["draft", "active", "inactive", "pending_homologation", "archived"]).optional(),
});

const createPackagingSpecSchema = z.object({
  skuId: z.string().min(1),
  componentType: z.string().min(1),
  itemId: z.string().min(1),
  qty: z.coerce.number().positive(),
});

const createComboSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  status: z.enum(["draft", "active", "inactive", "pending_homologation", "archived"]).optional(),
  items: z
    .array(
      z.object({
        skuId: z.string().min(1),
        qty: z.coerce.number().positive(),
      }),
    )
    .min(1),
});

const createAliasSchema = z.object({
  entityType: z.string().min(1),
  alias: z.string().min(1),
  canonicalId: z.string().optional(),
  canonicalName: z.string().optional(),
  originalValue: z.string().optional(),
  status: z.enum(["draft", "active", "inactive", "pending_homologation", "archived"]).optional(),
});

const homologateAliasSchema = z.object({
  entityType: z.string().min(1),
  alias: z.string().min(1),
  canonicalId: z.string().min(1),
  canonicalName: z.string().min(1),
});

const mergeCanonicalSchema = z.object({
  entityType: z.enum(["family", "product_base", "presentation", "sku", "combo"]),
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
  createSourceAlias: z.boolean().optional(),
});

const contextualUpsertSchema = z.object({
  entityType: z.enum(["family", "product_base", "presentation", "sku", "combo", "alias"]),
  label: z.string().min(1),
  code: z.string().optional(),
  originFlow: z.string().min(1),
  context: z.record(z.string(), z.any()).optional(),
  status: z.enum(["draft", "active", "inactive", "pending_homologation", "archived"]).optional(),
});

@Controller("catalog")
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get("families")
  families() {
    return this.catalogService.families();
  }

  @Post("families")
  @UsePipes(new ZodValidationPipe(createFamilySchema))
  createFamily(@Body() body: z.infer<typeof createFamilySchema>) {
    return this.catalogService.createFamily(body);
  }

  @Get("product-bases")
  productBases() {
    return this.catalogService.productBases();
  }

  @Post("product-bases")
  @UsePipes(new ZodValidationPipe(createProductBaseSchema))
  createPB(@Body() body: z.infer<typeof createProductBaseSchema>) {
    return this.catalogService.createProductBase(body);
  }

  @Get("presentations")
  presentations() {
    return this.catalogService.presentations();
  }

  @Post("presentations")
  @UsePipes(new ZodValidationPipe(createPresentationSchema))
  createPresentation(@Body() body: z.infer<typeof createPresentationSchema>) {
    return this.catalogService.createPresentation(body);
  }

  @Get("skus")
  skus() {
    return this.catalogService.skus();
  }

  @Post("skus")
  @UsePipes(new ZodValidationPipe(createSkuSchema))
  createSku(@Body() body: z.infer<typeof createSkuSchema>) {
    return this.catalogService.createSku(body);
  }

  @Get("packaging-specs")
  packagingSpecs() {
    return this.catalogService.packagingSpecs();
  }

  @Post("packaging-specs")
  @UsePipes(new ZodValidationPipe(createPackagingSpecSchema))
  createPackagingSpec(@Body() body: z.infer<typeof createPackagingSpecSchema>) {
    return this.catalogService.createPackagingSpec(body);
  }

  @Get("combos")
  combos() {
    return this.catalogService.combos();
  }

  @Post("combos")
  @UsePipes(new ZodValidationPipe(createComboSchema))
  createCombo(@Body() body: z.infer<typeof createComboSchema>) {
    return this.catalogService.createCombo(body);
  }

  @Get("aliases")
  aliases() {
    return this.catalogService.aliases();
  }

  @Post("aliases")
  @UsePipes(new ZodValidationPipe(createAliasSchema))
  createAlias(@Body() body: z.infer<typeof createAliasSchema>) {
    return this.catalogService.createAlias(body);
  }

  @Post("aliases/homologate")
  @UsePipes(new ZodValidationPipe(homologateAliasSchema))
  homologateAlias(@Body() body: z.infer<typeof homologateAliasSchema>) {
    return this.catalogService.homologateAlias(body);
  }

  @Post("merge")
  @UsePipes(new ZodValidationPipe(mergeCanonicalSchema))
  mergeCanonical(@Body() body: z.infer<typeof mergeCanonicalSchema>) {
    return this.catalogService.mergeCanonical(body);
  }

  @Get("search")
  search(@Query("q") query: string) {
    return this.catalogService.search(query);
  }

  @Post("contextual/upsert")
  @UsePipes(new ZodValidationPipe(contextualUpsertSchema))
  contextualUpsert(@Body() body: z.infer<typeof contextualUpsertSchema>) {
    return this.catalogService.contextualUpsert(body);
  }
}

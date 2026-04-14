import { Body, Controller, Get, Post, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { CatalogService } from "../application/catalog.service";

const createProductBaseSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(3),
});

@Controller("catalog")
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get("families")
  families() {
    return this.catalogService.families();
  }

  @Get("product-bases")
  productBases() {
    return this.catalogService.productBases();
  }

  @Post("product-bases")
  @UsePipes(new ZodValidationPipe(createProductBaseSchema))
  createPB(@Body() body: z.infer<typeof createProductBaseSchema>) {
    return this.catalogService.createProductBase(body.code, body.name);
  }

  @Get("skus")
  skus() {
    return this.catalogService.skus();
  }

  @Get("aliases")
  aliases() {
    return this.catalogService.aliases();
  }
}

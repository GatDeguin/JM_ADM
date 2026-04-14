import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { PricingService } from "../application/pricing.service";
import { createPriceListSchema, CreatePriceListDto, priceListActionSchema, PriceListActionDto, updatePriceListSchema, UpdatePriceListDto } from "./pricing.dto";

@Controller("pricing")
export class PricingController {
  constructor(private readonly service: PricingService) {}

  @Get("price-lists")
  list() { return this.service.list(); }

  @Get("price-lists/:id")
  get(@Param("id") id: string) { return this.service.get(id); }

  @Post("price-lists")
  @UsePipes(new ZodValidationPipe(createPriceListSchema))
  create(@Body() body: CreatePriceListDto) { return this.service.create(body); }

  @Patch("price-lists/:id")
  @UsePipes(new ZodValidationPipe(updatePriceListSchema))
  update(@Param("id") id: string, @Body() body: UpdatePriceListDto) { return this.service.update(id, body); }

  @Delete("price-lists/:id")
  remove(@Param("id") id: string) { return this.service.remove(id); }

  @Post("price-lists/:id/action")
  @UsePipes(new ZodValidationPipe(priceListActionSchema))
  runAction(@Param("id") id: string, @Body() payload: PriceListActionDto) { return this.service.runAction(id, payload); }
}

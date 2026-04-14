import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionPriceListInput, CreatePriceListInput, PriceListDto, UpdatePriceListInput } from "../domain/pricing.types";

@Injectable()
export class PricingRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<PriceListDto[]> { return this.prisma.priceList.findMany({ orderBy: { id: "desc" } }) as Promise<PriceListDto[]>; }
  get(id: string): Promise<PriceListDto> { return this.prisma.priceList.findUniqueOrThrow({ where: { id } }) as Promise<PriceListDto>; }
  create(data: CreatePriceListInput): Promise<PriceListDto> { return this.prisma.priceList.create({ data: data as any }) as Promise<PriceListDto>; }
  update(id: string, data: UpdatePriceListInput): Promise<PriceListDto> { return this.prisma.priceList.update({ where: { id }, data: data as any }) as Promise<PriceListDto>; }
  remove(id: string) { return this.prisma.priceList.delete({ where: { id } }); }

  runAction(id: string, payload: ActionPriceListInput): Promise<PriceListDto> {
    void payload;
    return this.prisma.priceList.update({ where: { id }, data: { status: "active" } }) as Promise<PriceListDto>;
  }
}

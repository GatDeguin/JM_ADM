import { Injectable } from "@nestjs/common";
import { PricingRepository } from "../infrastructure/pricing.repository";
import { ActionPriceListInput, CreatePriceListInput, PriceListDto, UpdatePriceListInput } from "../domain/pricing.types";

@Injectable()
export class PricingService {
  constructor(private readonly repository: PricingRepository) {}

  list(): Promise<PriceListDto[]> { return this.repository.list(); }
  get(id: string): Promise<PriceListDto> { return this.repository.get(id); }
  create(data: CreatePriceListInput): Promise<PriceListDto> { return this.repository.create(data); }
  update(id: string, data: UpdatePriceListInput): Promise<PriceListDto> { return this.repository.update(id, data); }
  remove(id: string) { return this.repository.remove(id); }
  runAction(id: string, payload: ActionPriceListInput): Promise<PriceListDto> { return this.repository.runAction(id, payload); }
}

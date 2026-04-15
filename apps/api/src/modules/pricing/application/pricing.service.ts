import { HttpStatus, Injectable } from "@nestjs/common";
import { throwDomainError } from "../../../common/domain-rules/domain-errors";
import { assertRequiredText } from "../../../common/domain-rules/shared-domain-rules";
import { PricingRepository } from "../infrastructure/pricing.repository";
import { ActionPriceListInput, CreatePriceListInput, PriceListDto, UpdatePriceListInput } from "../domain/pricing.types";

@Injectable()
export class PricingService {
  constructor(private readonly repository: PricingRepository) {}

  list(): Promise<PriceListDto[]> { return this.repository.list(); }
  get(id: string): Promise<PriceListDto> { return this.repository.get(id); }

  create(data: CreatePriceListInput): Promise<PriceListDto> {
    assertRequiredText(data.code, "el código de lista");
    assertRequiredText(data.name, "el nombre de lista");
    if (!data.startsAt) {
      throwDomainError("RULE_PRICING_START_DATE_REQUIRED", "La lista de precios debe indicar fecha de vigencia.", HttpStatus.BAD_REQUEST, "R-PR-003");
    }
    return this.repository.create(data);
  }

  async update(id: string, data: UpdatePriceListInput): Promise<PriceListDto> {
    const current = await this.repository.get(id);
    if (current.status === "archived") {
      throwDomainError("RULE_PRICING_ARCHIVED_IMMUTABLE", "La lista archivada no admite modificaciones.", HttpStatus.CONFLICT, "R-PR-004");
    }
    return this.repository.update(id, data);
  }

  remove(id: string) { return this.repository.remove(id); }
  runAction(id: string, payload: ActionPriceListInput): Promise<PriceListDto> { return this.repository.runAction(id, payload); }
}

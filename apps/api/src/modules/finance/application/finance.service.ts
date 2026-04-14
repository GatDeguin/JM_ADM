import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class FinanceService {
  registerInventoryAdjustment(itemId: string, qty: number, reason: string) {
    if (!itemId) {
      throw new BadRequestException("item required");
    }
    if (qty === 0) {
      throw new BadRequestException("qty must be different from zero");
    }
    if (!reason?.trim()) {
      throw new BadRequestException("reason required");
    }

    return {
      event: "finance.inventory.adjustment.registered",
      itemId,
      qty,
      reason,
    };
  }
}

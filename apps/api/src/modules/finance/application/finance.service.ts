import { Injectable } from "@nestjs/common";
import { assertNonZeroNumber, assertRequiredText } from "../../../common/domain-rules/shared-domain-rules";

@Injectable()
export class FinanceService {
  registerInventoryAdjustment(itemId: string, qty: number, reason: string) {
    assertRequiredText(itemId, "el item de stock");
    assertNonZeroNumber(qty, "La cantidad de ajuste");
    assertRequiredText(reason, "el motivo del ajuste");

    return {
      event: "finance.inventory.adjustment.registered",
      itemId,
      qty,
      reason,
    };
  }
}

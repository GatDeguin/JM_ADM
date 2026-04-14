import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { FinanceService } from "../application/finance.service";
import { integrationFixtures } from "../../../test-data/integration-fixtures";

describe("finance integration", () => {
  it("bloquea ajustes sin motivo", () => {
    const service = new FinanceService();

    expect(() => service.registerInventoryAdjustment(integrationFixtures.finance.itemId, 3, "")).toThrow(BadRequestException);
  });

  it("acepta ajustes con motivo", () => {
    const service = new FinanceService();

    const result = service.registerInventoryAdjustment(
      integrationFixtures.finance.itemId,
      integrationFixtures.finance.qty,
      integrationFixtures.finance.reason,
    );

    expect(result.event).toBe("finance.inventory.adjustment.registered");
  });
});

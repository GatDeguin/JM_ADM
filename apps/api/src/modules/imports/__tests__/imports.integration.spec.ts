import { describe, expect, it } from "vitest";
import { ImportersService } from "../application/importers.service";
import { integrationFixtures } from "../../../test-data/integration-fixtures";

describe("imports integration", () => {
  it("genera warnings reproducibles por faltantes y duplicados", () => {
    const service = new ImportersService();

    const result = service.process("formulas", [...integrationFixtures.imports.rows]);

    expect(result.summary.total).toBe(4);
    expect(result.summary.duplicates).toBe(1);
    expect(result.summary.pendingHomologation).toBe(1);
    expect(result.warnings.some((warning) => warning.includes("falta code"))).toBe(true);
  });
});

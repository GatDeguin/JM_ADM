import { describe, expect, it } from "vitest";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { FormulasService } from "../application/formulas.service";

describe("formulas integration", () => {
  it("falla detalle cuando no existe", async () => {
    const service = new FormulasService({ findById: async () => null } as never);
    await expect(service.detail("missing")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("controla conflicto por código duplicado", async () => {
    const service = new FormulasService({
      create: async () => {
        throw { code: "P2002" };
      },
    } as never);

    await expect(service.create("F-1", "Formula")).rejects.toBeInstanceOf(ConflictException);
  });
});

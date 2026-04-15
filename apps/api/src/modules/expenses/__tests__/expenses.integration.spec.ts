import { describe, expect, it, vi } from "vitest";
import { RequestMethod } from "@nestjs/common";
import { METHOD_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import { ExpensesService } from "../application/expenses.service";
import { ExpensesController } from "../presentation/expenses.controller";
import { mapLegacyPath, mapNormalizedPathToLegacy } from "../../../config/api-routes";

describe("expenses integration", () => {
  it("actualiza estado y aplica acción", async () => {
    const repo = {
      list: vi.fn(), get: vi.fn(), create: vi.fn(), remove: vi.fn(),
      update: vi.fn(async (_id, data) => ({ id: "exp-1", ...data })),
      runAction: vi.fn(async () => ({ id: "exp-1", status: "paid" })),
    };
    const service = new ExpensesService(repo as never);

    const updated = await service.update("exp-1", { status: "partial" });
    const acted = await service.runAction("exp-1", {});

    expect(updated.status).toBe("partial");
    expect(acted.status).toBe("paid");
  });

  it("normaliza rutas del controlador sin duplicar prefijo de recurso", () => {
    expect(Reflect.getMetadata(PATH_METADATA, ExpensesController)).toBe("expenses");

    const listHandler = Reflect.getMetadata(PATH_METADATA, ExpensesController.prototype.list);
    const getHandler = Reflect.getMetadata(PATH_METADATA, ExpensesController.prototype.get);
    const createHandler = Reflect.getMetadata(PATH_METADATA, ExpensesController.prototype.create);
    const updateHandler = Reflect.getMetadata(PATH_METADATA, ExpensesController.prototype.update);
    const removeHandler = Reflect.getMetadata(PATH_METADATA, ExpensesController.prototype.remove);
    const actionHandler = Reflect.getMetadata(PATH_METADATA, ExpensesController.prototype.runAction);
    const createMethod = Reflect.getMetadata(METHOD_METADATA, ExpensesController.prototype.create);

    expect(listHandler).toBe("/");
    expect(getHandler).toBe(":id");
    expect(createHandler).toBe("/");
    expect(updateHandler).toBe(":id");
    expect(removeHandler).toBe(":id");
    expect(actionHandler).toBe(":id/action");
    expect(createMethod).toBe(RequestMethod.POST);
    expect(mapLegacyPath("/expenses")).toBe("/finance/expenses");
    expect(mapNormalizedPathToLegacy("/finance/expenses")).toBe("/expenses");
  });
});

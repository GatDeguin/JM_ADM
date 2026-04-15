import { describe, expect, it, vi } from "vitest";
import { RequestMethod } from "@nestjs/common";
import { METHOD_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import { CustomersService } from "../application/customers.service";
import { CustomersController } from "../presentation/customers.controller";
import { mapLegacyPath, mapNormalizedPathToLegacy } from "../../../config/api-routes";

describe("customers integration", () => {
  it("delegates CRUD and business action to repository", async () => {
    const repo = {
      list: vi.fn(async () => [{ id: "c-1" }]),
      get: vi.fn(async () => ({ id: "c-1" })),
      create: vi.fn(async (data) => ({ id: "c-2", ...data })),
      update: vi.fn(async (_id, data) => ({ id: "c-1", ...data })),
      remove: vi.fn(async () => ({ id: "c-1" })),
      runAction: vi.fn(async () => ({ id: "c-1", status: "archived" })),
    };

    const service = new CustomersService(repo as never);
    await service.list();
    await service.get("c-1");
    await service.create({ code: "C1", name: "Acme" });
    await service.update("c-1", { name: "Acme 2" });
    await service.remove("c-1");
    const acted = await service.runAction("c-1", {});

    expect(repo.list).toHaveBeenCalled();
    expect(repo.runAction).toHaveBeenCalledWith("c-1", {});
    expect(acted.status).toBe("archived");
  });

  it("normaliza rutas del controlador sin duplicar prefijo de recurso", () => {
    expect(Reflect.getMetadata(PATH_METADATA, CustomersController)).toBe("customers");

    const listHandler = Reflect.getMetadata(PATH_METADATA, CustomersController.prototype.list);
    const getHandler = Reflect.getMetadata(PATH_METADATA, CustomersController.prototype.get);
    const createHandler = Reflect.getMetadata(PATH_METADATA, CustomersController.prototype.create);
    const updateHandler = Reflect.getMetadata(PATH_METADATA, CustomersController.prototype.update);
    const removeHandler = Reflect.getMetadata(PATH_METADATA, CustomersController.prototype.remove);
    const actionHandler = Reflect.getMetadata(PATH_METADATA, CustomersController.prototype.runAction);
    const createMethod = Reflect.getMetadata(METHOD_METADATA, CustomersController.prototype.create);

    expect(listHandler).toBe("/");
    expect(getHandler).toBe(":id");
    expect(createHandler).toBe("/");
    expect(updateHandler).toBe(":id");
    expect(removeHandler).toBe(":id");
    expect(actionHandler).toBe(":id/action");
    expect(createMethod).toBe(RequestMethod.POST);
    expect(mapLegacyPath("/customers")).toBe("/commercial/customers");
    expect(mapNormalizedPathToLegacy("/commercial/customers")).toBe("/customers");
  });
});

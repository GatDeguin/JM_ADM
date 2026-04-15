import { describe, expect, it, vi } from "vitest";
import { RequestMethod } from "@nestjs/common";
import { METHOD_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import { UsersService } from "../application/users.service";
import { UsersController } from "../presentation/users.controller";
import { mapLegacyPath, mapNormalizedPathToLegacy } from "../../../config/api-routes";

describe("users integration", () => {
  it("crea usuario y ejecuta acción", async () => {
    const repo = {
      list: vi.fn(), get: vi.fn(), update: vi.fn(), remove: vi.fn(),
      create: vi.fn(async (data) => ({ id: "u-1", ...data })),
      runAction: vi.fn(async () => ({ id: "u-1", status: "archived" })),
    };
    const service = new UsersService(repo as never);

    const created = await service.create({ email: "demo@acme.com", name: "Demo", passwordHash: "1234" });
    const acted = await service.runAction("u-1", {});

    expect(created.email).toBe("demo@acme.com");
    expect(acted.status).toBe("archived");
  });

  it("normaliza rutas del controlador sin duplicar prefijo de recurso", () => {
    expect(Reflect.getMetadata(PATH_METADATA, UsersController)).toBe("users");

    const listHandler = Reflect.getMetadata(PATH_METADATA, UsersController.prototype.list);
    const getHandler = Reflect.getMetadata(PATH_METADATA, UsersController.prototype.get);
    const createHandler = Reflect.getMetadata(PATH_METADATA, UsersController.prototype.create);
    const updateHandler = Reflect.getMetadata(PATH_METADATA, UsersController.prototype.update);
    const removeHandler = Reflect.getMetadata(PATH_METADATA, UsersController.prototype.remove);
    const actionHandler = Reflect.getMetadata(PATH_METADATA, UsersController.prototype.runAction);
    const createMethod = Reflect.getMetadata(METHOD_METADATA, UsersController.prototype.create);

    expect(listHandler).toBe("/");
    expect(getHandler).toBe(":id");
    expect(createHandler).toBe("/");
    expect(updateHandler).toBe(":id");
    expect(removeHandler).toBe(":id");
    expect(actionHandler).toBe(":id/action");
    expect(createMethod).toBe(RequestMethod.POST);
    expect(mapLegacyPath("/users")).toBe("/system/users");
    expect(mapNormalizedPathToLegacy("/system/users")).toBe("/users");
  });
});

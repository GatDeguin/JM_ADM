import { describe, expect, it, vi } from "vitest";
import { RolesPermissionsService } from "../application/roles_permissions.service";

describe("roles_permissions integration", () => {
  it("asigna permiso por acción de negocio", async () => {
    const repo = {
      list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(),
      runAction: vi.fn(async (_id, payload) => ({ roleId: "r-1", permissionId: payload.permissionId })),
    };
    const service = new RolesPermissionsService(repo as never);

    const result = await service.runAction("r-1", { permissionId: "perm-1" });
    expect(result).toEqual({ roleId: "r-1", permissionId: "perm-1" });
  });
});

import { describe, expect, it } from "vitest";
import { ForbiddenException } from "@nestjs/common";
import { AuthService } from "../application/auth.service";
import { integrationFixtures } from "../../../test-data/integration-fixtures";

describe("auth integration", () => {
  it("login exitoso retorna token", async () => {
    const service = new AuthService({
      findUserByEmail: async (email: string) => (email === integrationFixtures.auth.validEmail ? { email } : null),
    } as never);

    const result = await service.login(integrationFixtures.auth.validEmail, integrationFixtures.auth.password);

    expect(result.token).toBe("demo-token");
    expect(result.user.email).toBe(integrationFixtures.auth.validEmail);
  });

  it("rechaza credenciales inválidas", async () => {
    const service = new AuthService({ findUserByEmail: async () => null } as never);

    await expect(service.login(integrationFixtures.auth.invalidEmail, integrationFixtures.auth.password)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});

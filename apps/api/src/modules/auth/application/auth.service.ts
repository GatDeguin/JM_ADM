import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthRepository } from "../infrastructure/auth.repository";

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async login(email: string, _password: string) {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new ForbiddenException("Credenciales inválidas");
    }
    return {
      token: "demo-token",
      user: { email: user.email, role: "admin" },
    };
  }

  refresh() {
    return { token: "demo-token-refresh" };
  }

  logout() {
    return { ok: true };
  }

  me() {
    return { email: "admin@demo.local", roles: ["admin"] };
  }
}

import { Body, Controller, Get, Post, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { AuthService } from "../application/auth.service";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @UsePipes(new ZodValidationPipe(loginSchema))
  login(@Body() body: z.infer<typeof loginSchema>) {
    return this.authService.login(body.email, body.password);
  }

  @Post("refresh")
  refresh() {
    return this.authService.refresh();
  }

  @Post("logout")
  logout() {
    return this.authService.logout();
  }

  @Get("me")
  me() {
    return this.authService.me();
  }
}

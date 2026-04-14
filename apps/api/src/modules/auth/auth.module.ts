import { Module } from "@nestjs/common";
import { AuthService } from "./application/auth.service";
import { AuthRepository } from "./infrastructure/auth.repository";
import { AuthController } from "./presentation/auth.controller";

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository],
})
export class AuthModule {}

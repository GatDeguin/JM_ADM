import { Module } from "@nestjs/common";
import { UsersController } from "./presentation/users.controller";
import { UsersService } from "./application/users.service";
import { UsersRepository } from "./infrastructure/users.repository";

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}

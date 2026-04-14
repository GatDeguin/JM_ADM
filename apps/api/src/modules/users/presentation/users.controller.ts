import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { UsersService } from "../application/users.service";
import { createUserSchema, CreateUserDto, updateUserSchema, UpdateUserDto, userActionSchema, UserActionDto } from "./users.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get("users")
  list() { return this.service.list(); }

  @Get("users/:id")
  get(@Param("id") id: string) { return this.service.get(id); }

  @Post("users")
  @UsePipes(new ZodValidationPipe(createUserSchema))
  create(@Body() body: CreateUserDto) { return this.service.create(body); }

  @Patch("users/:id")
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  update(@Param("id") id: string, @Body() body: UpdateUserDto) { return this.service.update(id, body); }

  @Delete("users/:id")
  remove(@Param("id") id: string) { return this.service.remove(id); }

  @Post("users/:id/action")
  @UsePipes(new ZodValidationPipe(userActionSchema))
  runAction(@Param("id") id: string, @Body() payload: UserActionDto) { return this.service.runAction(id, payload); }
}

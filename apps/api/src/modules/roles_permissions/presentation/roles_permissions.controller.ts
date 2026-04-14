import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { RolesPermissionsService } from "../application/roles_permissions.service";
import { createRoleSchema, CreateRoleDto, roleActionSchema, RoleActionDto, updateRoleSchema, UpdateRoleDto } from "./roles_permissions.dto";

@Controller("roles_permissions")
export class RolesPermissionsController {
  constructor(private readonly service: RolesPermissionsService) {}

  @Get("roles")
  list() { return this.service.list(); }

  @Get("roles/:id")
  get(@Param("id") id: string) { return this.service.get(id); }

  @Post("roles")
  @UsePipes(new ZodValidationPipe(createRoleSchema))
  create(@Body() body: CreateRoleDto) { return this.service.create(body); }

  @Patch("roles/:id")
  @UsePipes(new ZodValidationPipe(updateRoleSchema))
  update(@Param("id") id: string, @Body() body: UpdateRoleDto) { return this.service.update(id, body); }

  @Delete("roles/:id")
  remove(@Param("id") id: string) { return this.service.remove(id); }

  @Post("roles/:id/action")
  @UsePipes(new ZodValidationPipe(roleActionSchema))
  runAction(@Param("id") id: string, @Body() payload: RoleActionDto) { return this.service.runAction(id, payload); }
}

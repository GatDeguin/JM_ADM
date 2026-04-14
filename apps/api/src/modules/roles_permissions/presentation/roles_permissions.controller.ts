import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { RolesPermissionsService } from "../application/roles_permissions.service";

const createSchema = z.object({ name: z.string().min(2) });
const updateSchema = z.object({ name: z.string().min(2) });
const actionSchema = z.object({ permissionId: z.string().min(1) });

@Controller("roles_permissions")
export class RolesPermissionsController {
  constructor(private readonly service: RolesPermissionsService) {}

  @Get("roles")
  list() {
    return this.service.list();
  }

  @Get("roles/:id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @Post("roles")
  @UsePipes(new ZodValidationPipe(createSchema))
  create(@Body() body: z.infer<typeof createSchema>) {
    return this.service.create(body);
  }

  @Patch("roles/:id")
  @UsePipes(new ZodValidationPipe(updateSchema))
  update(@Param("id") id: string, @Body() body: z.infer<typeof updateSchema>) {
    return this.service.update(id, body);
  }

  @Delete("roles/:id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }

  @Post("roles/:id/action")
  @UsePipes(new ZodValidationPipe(actionSchema))
  runAction(@Param("id") id: string, @Body() payload: z.infer<typeof actionSchema>) {
    return this.service.runAction(id, payload);
  }
}

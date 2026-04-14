import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { UsersService } from "../application/users.service";

const createSchema = z.object({ email: z.string().email(), name: z.string().min(2), passwordHash: z.string().min(4) });
const updateSchema = z.object({ name: z.string().min(2).optional(), status: z.enum(["draft", "active", "inactive", "pending_homologation", "archived"]).optional() });
const actionSchema = z.object({});

@Controller("users")
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get("users")
  list() {
    return this.service.list();
  }

  @Get("users/:id")
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @Post("users")
  @UsePipes(new ZodValidationPipe(createSchema))
  create(@Body() body: z.infer<typeof createSchema>) {
    return this.service.create(body);
  }

  @Patch("users/:id")
  @UsePipes(new ZodValidationPipe(updateSchema))
  update(@Param("id") id: string, @Body() body: z.infer<typeof updateSchema>) {
    return this.service.update(id, body);
  }

  @Delete("users/:id")
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }

  @Post("users/:id/action")
  @UsePipes(new ZodValidationPipe(actionSchema))
  runAction(@Param("id") id: string, @Body() payload: z.infer<typeof actionSchema>) {
    return this.service.runAction(id, payload);
  }
}

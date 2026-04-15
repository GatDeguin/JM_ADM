import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe";
import { CustomersService } from "../application/customers.service";
import { createCustomerSchema, CreateCustomerDto, customerActionSchema, CustomerActionDto, updateCustomerSchema, UpdateCustomerDto } from "./customers.dto";

@Controller("customers")
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get("")
  list() { return this.service.list(); }

  @Get(":id")
  get(@Param("id") id: string) { return this.service.get(id); }

  @Post("")
  @UsePipes(new ZodValidationPipe(createCustomerSchema))
  create(@Body() body: CreateCustomerDto) { return this.service.create(body); }

  @Patch(":id")
  @UsePipes(new ZodValidationPipe(updateCustomerSchema))
  update(@Param("id") id: string, @Body() body: UpdateCustomerDto) { return this.service.update(id, body); }

  @Delete(":id")
  remove(@Param("id") id: string) { return this.service.remove(id); }

  @Post(":id/action")
  @UsePipes(new ZodValidationPipe(customerActionSchema))
  runAction(@Param("id") id: string, @Body() payload: CustomerActionDto) { return this.service.runAction(id, payload); }
}

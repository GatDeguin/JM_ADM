import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionCustomerInput, CreateCustomerInput, CustomerDto, UpdateCustomerInput } from "../domain/customers.types";

@Injectable()
export class CustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<CustomerDto[]> { return this.prisma.customer.findMany({ orderBy: { id: "desc" } }) as Promise<CustomerDto[]>; }
  get(id: string): Promise<CustomerDto> { return this.prisma.customer.findUniqueOrThrow({ where: { id } }) as Promise<CustomerDto>; }
  create(data: CreateCustomerInput): Promise<CustomerDto> { return this.prisma.customer.create({ data: data as any }) as Promise<CustomerDto>; }
  update(id: string, data: UpdateCustomerInput): Promise<CustomerDto> { return this.prisma.customer.update({ where: { id }, data: data as any }) as Promise<CustomerDto>; }
  remove(id: string) { return this.prisma.customer.delete({ where: { id } }); }

  runAction(id: string, payload: ActionCustomerInput): Promise<CustomerDto> {
    void payload;
    return this.prisma.customer.update({ where: { id }, data: { status: "archived" } }) as Promise<CustomerDto>;
  }
}

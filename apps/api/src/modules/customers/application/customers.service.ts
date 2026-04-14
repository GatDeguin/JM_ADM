import { Injectable } from "@nestjs/common";
import { CustomersRepository } from "../infrastructure/customers.repository";
import { ActionCustomerInput, CreateCustomerInput, CustomerDto, UpdateCustomerInput } from "../domain/customers.types";

@Injectable()
export class CustomersService {
  constructor(private readonly repository: CustomersRepository) {}

  list(): Promise<CustomerDto[]> { return this.repository.list(); }
  get(id: string): Promise<CustomerDto> { return this.repository.get(id); }
  create(data: CreateCustomerInput): Promise<CustomerDto> { return this.repository.create(data); }
  update(id: string, data: UpdateCustomerInput): Promise<CustomerDto> { return this.repository.update(id, data); }
  remove(id: string) { return this.repository.remove(id); }
  runAction(id: string, payload: ActionCustomerInput): Promise<CustomerDto> { return this.repository.runAction(id, payload); }
}

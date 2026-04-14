import { Injectable } from "@nestjs/common";
import { ExpensesRepository } from "../infrastructure/expenses.repository";
import { ActionExpenseInput, CreateExpenseInput, ExpenseDto, UpdateExpenseInput } from "../domain/expenses.types";

@Injectable()
export class ExpensesService {
  constructor(private readonly repository: ExpensesRepository) {}

  list(): Promise<ExpenseDto[]> { return this.repository.list(); }
  get(id: string): Promise<ExpenseDto> { return this.repository.get(id); }
  create(data: CreateExpenseInput): Promise<ExpenseDto> { return this.repository.create(data); }
  update(id: string, data: UpdateExpenseInput): Promise<ExpenseDto> { return this.repository.update(id, data); }
  remove(id: string) { return this.repository.remove(id); }
  runAction(id: string, payload: ActionExpenseInput): Promise<ExpenseDto> { return this.repository.runAction(id, payload); }
}

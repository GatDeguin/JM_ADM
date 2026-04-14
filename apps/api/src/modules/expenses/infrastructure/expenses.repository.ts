import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionExpenseInput, CreateExpenseInput, ExpenseDto, UpdateExpenseInput } from "../domain/expenses.types";

@Injectable()
export class ExpensesRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<ExpenseDto[]> { return this.prisma.expense.findMany({ orderBy: { id: "desc" } }) as Promise<ExpenseDto[]>; }
  get(id: string): Promise<ExpenseDto> { return this.prisma.expense.findUniqueOrThrow({ where: { id } }) as Promise<ExpenseDto>; }
  create(data: CreateExpenseInput): Promise<ExpenseDto> { return this.prisma.expense.create({ data: data as any }) as Promise<ExpenseDto>; }
  update(id: string, data: UpdateExpenseInput): Promise<ExpenseDto> { return this.prisma.expense.update({ where: { id }, data: data as any }) as Promise<ExpenseDto>; }
  remove(id: string) { return this.prisma.expense.delete({ where: { id } }); }

  runAction(id: string, payload: ActionExpenseInput): Promise<ExpenseDto> {
    void payload;
    return this.prisma.expense.update({ where: { id }, data: { status: "paid" } }) as Promise<ExpenseDto>;
  }
}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionMonthlyCloseInput, CreateMonthlyCloseInput, MonthlyCloseDto, UpdateMonthlyCloseInput } from "../domain/costing.types";

@Injectable()
export class CostingRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<MonthlyCloseDto[]> { return this.prisma.monthlyClose.findMany({ orderBy: { id: "desc" } }) as Promise<MonthlyCloseDto[]>; }
  get(id: string): Promise<MonthlyCloseDto> { return this.prisma.monthlyClose.findUniqueOrThrow({ where: { id } }) as Promise<MonthlyCloseDto>; }
  create(data: CreateMonthlyCloseInput): Promise<MonthlyCloseDto> { return this.prisma.monthlyClose.create({ data: data as any }) as Promise<MonthlyCloseDto>; }
  update(id: string, data: UpdateMonthlyCloseInput): Promise<MonthlyCloseDto> { return this.prisma.monthlyClose.update({ where: { id }, data: data as any }) as Promise<MonthlyCloseDto>; }
  remove(id: string) { return this.prisma.monthlyClose.delete({ where: { id } }); }

  runAction(id: string, payload: ActionMonthlyCloseInput): Promise<MonthlyCloseDto> {
    void payload;
    return this.prisma.monthlyClose.update({ where: { id }, data: { status: "closed", closedAt: new Date() } }) as Promise<MonthlyCloseDto>;
  }
}

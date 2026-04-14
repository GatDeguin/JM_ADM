import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";

@Injectable()
export class FormulasRepository {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.formulaTemplate.findMany({ orderBy: { name: "asc" } });
  }

  findById(id: string) {
    return this.prisma.formulaTemplate.findUnique({ where: { id } });
  }

  create(code: string, name: string) {
    return this.prisma.formulaTemplate.create({ data: { code, name, status: "draft" } });
  }

  approve(id: string) {
    return this.prisma.formulaTemplate.update({ where: { id }, data: { status: "approved" } });
  }
}

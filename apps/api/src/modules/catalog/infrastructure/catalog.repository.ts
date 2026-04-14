import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";

@Injectable()
export class CatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  findFamilies() {
    return this.prisma.family.findMany({ orderBy: { name: "asc" } });
  }

  findProductBases() {
    return this.prisma.productBase.findMany({ orderBy: { name: "asc" } });
  }

  createProductBase(code: string, name: string) {
    return this.prisma.productBase.create({ data: { code, name } });
  }

  findSkus() {
    return this.prisma.sKU.findMany({ orderBy: { code: "asc" } });
  }

  findAliases() {
    return this.prisma.entityAlias.findMany({ orderBy: { alias: "asc" } });
  }
}

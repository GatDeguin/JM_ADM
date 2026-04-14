import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionPackagingOrderInput, CreatePackagingOrderInput, PackagingOrderDto, UpdatePackagingOrderInput } from "../domain/packaging.types";

const packagingOrderInclude = {
  parentBatch: { select: { id: true, code: true, status: true } },
  sku: { select: { id: true, code: true, status: true } },
} as const;

@Injectable()
export class PackagingRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<PackagingOrderDto[]> {
    return this.prisma.packagingOrder.findMany({ orderBy: { id: "desc" }, include: packagingOrderInclude }) as Promise<PackagingOrderDto[]>;
  }

  get(id: string): Promise<PackagingOrderDto> {
    return this.prisma.packagingOrder.findUniqueOrThrow({ where: { id }, include: packagingOrderInclude }) as Promise<PackagingOrderDto>;
  }

  create(data: CreatePackagingOrderInput): Promise<PackagingOrderDto> {
    return this.prisma.packagingOrder.create({ data: data as any, include: packagingOrderInclude }) as Promise<PackagingOrderDto>;
  }

  update(id: string, data: UpdatePackagingOrderInput): Promise<PackagingOrderDto> {
    return this.prisma.packagingOrder.update({ where: { id }, data: data as any, include: packagingOrderInclude }) as Promise<PackagingOrderDto>;
  }

  remove(id: string) {
    return this.prisma.packagingOrder.update({ where: { id }, data: { status: "cancelled" }, include: packagingOrderInclude });
  }

  runAction(id: string, payload: ActionPackagingOrderInput): Promise<PackagingOrderDto> {
    void payload;
    return this.prisma.packagingOrder.update({ where: { id }, data: { status: "released" }, include: packagingOrderInclude }) as Promise<PackagingOrderDto>;
  }
}

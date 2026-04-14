import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionPackagingOrderInput, CreatePackagingOrderInput, PackagingOrderDto, UpdatePackagingOrderInput } from "../domain/packaging.types";

@Injectable()
export class PackagingRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<PackagingOrderDto[]> { return this.prisma.packagingOrder.findMany({ orderBy: { id: "desc" } }) as Promise<PackagingOrderDto[]>; }
  get(id: string): Promise<PackagingOrderDto> { return this.prisma.packagingOrder.findUniqueOrThrow({ where: { id } }) as Promise<PackagingOrderDto>; }
  create(data: CreatePackagingOrderInput): Promise<PackagingOrderDto> { return this.prisma.packagingOrder.create({ data: data as any }) as Promise<PackagingOrderDto>; }
  update(id: string, data: UpdatePackagingOrderInput): Promise<PackagingOrderDto> { return this.prisma.packagingOrder.update({ where: { id }, data: data as any }) as Promise<PackagingOrderDto>; }
  remove(id: string) { return this.prisma.packagingOrder.delete({ where: { id } }); }

  runAction(id: string, payload: ActionPackagingOrderInput): Promise<PackagingOrderDto> {
    void payload;
    return this.prisma.packagingOrder.update({ where: { id }, data: { status: "released" } }) as Promise<PackagingOrderDto>;
  }
}

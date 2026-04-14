import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionUnitInput, CreateUnitInput, UnitDto, UpdateUnitInput } from "../domain/masters.types";

@Injectable()
export class MastersRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<UnitDto[]> { return this.prisma.unit.findMany({ orderBy: { id: "desc" } }) as Promise<UnitDto[]>; }
  get(id: string): Promise<UnitDto> { return this.prisma.unit.findUniqueOrThrow({ where: { id } }) as Promise<UnitDto>; }
  create(data: CreateUnitInput): Promise<UnitDto> { return this.prisma.unit.create({ data: data as any }) as Promise<UnitDto>; }
  update(id: string, data: UpdateUnitInput): Promise<UnitDto> { return this.prisma.unit.update({ where: { id }, data: data as any }) as Promise<UnitDto>; }
  remove(id: string) { return this.prisma.unit.delete({ where: { id } }); }

  runAction(id: string, payload: ActionUnitInput): Promise<UnitDto> {
    void payload;
    return this.prisma.unit.update({ where: { id }, data: { status: "inactive" } }) as Promise<UnitDto>;
  }
}

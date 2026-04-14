import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionUserInput, CreateUserInput, UserDto, UpdateUserInput } from "../domain/users.types";

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<UserDto[]> { return this.prisma.user.findMany({ orderBy: { id: "desc" } }) as Promise<UserDto[]>; }
  get(id: string): Promise<UserDto> { return this.prisma.user.findUniqueOrThrow({ where: { id } }) as Promise<UserDto>; }
  create(data: CreateUserInput): Promise<UserDto> { return this.prisma.user.create({ data: data as any }) as Promise<UserDto>; }
  update(id: string, data: UpdateUserInput): Promise<UserDto> { return this.prisma.user.update({ where: { id }, data: data as any }) as Promise<UserDto>; }
  remove(id: string) { return this.prisma.user.delete({ where: { id } }); }

  runAction(id: string, payload: ActionUserInput): Promise<UserDto> {
    void payload;
    return this.prisma.user.update({ where: { id }, data: { status: "inactive" } }) as Promise<UserDto>;
  }
}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionRoleInput, CreateRoleInput, RoleDto, UpdateRoleInput } from "../domain/roles_permissions.types";

const roleInclude = {
  permissions: {
    select: {
      permission: {
        select: {
          id: true,
          key: true,
        },
      },
    },
  },
} as const;

@Injectable()
export class RolesPermissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<RoleDto[]> { return this.prisma.role.findMany({ orderBy: { id: "desc" }, where: { deletedAt: null }, include: roleInclude }) as Promise<RoleDto[]>; }
  get(id: string): Promise<RoleDto> { return this.prisma.role.findUniqueOrThrow({ where: { id }, include: roleInclude }) as Promise<RoleDto>; }
  create(data: CreateRoleInput): Promise<RoleDto> { return this.prisma.role.create({ data: data as any, include: roleInclude }) as Promise<RoleDto>; }
  update(id: string, data: UpdateRoleInput): Promise<RoleDto> { return this.prisma.role.update({ where: { id }, data: data as any, include: roleInclude }) as Promise<RoleDto>; }
  remove(id: string) { return this.prisma.role.update({ where: { id }, data: { status: "inactive", deletedAt: new Date() }, include: roleInclude }); }

  runAction(id: string, payload: ActionRoleInput): Promise<unknown> {
    return this.prisma.rolePermission.create({ data: { roleId: id, permissionId: payload.permissionId } });
  }
}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/prisma/prisma.service";
import { ActionRoleInput, CreateRoleInput, RoleDto, UpdateRoleInput } from "../domain/roles_permissions.types";

@Injectable()
export class RolesPermissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(): Promise<RoleDto[]> { return this.prisma.role.findMany({ orderBy: { id: "desc" } }) as Promise<RoleDto[]>; }
  get(id: string): Promise<RoleDto> { return this.prisma.role.findUniqueOrThrow({ where: { id } }) as Promise<RoleDto>; }
  create(data: CreateRoleInput): Promise<RoleDto> { return this.prisma.role.create({ data: data as any }) as Promise<RoleDto>; }
  update(id: string, data: UpdateRoleInput): Promise<RoleDto> { return this.prisma.role.update({ where: { id }, data: data as any }) as Promise<RoleDto>; }
  remove(id: string) { return this.prisma.role.delete({ where: { id } }); }

  runAction(id: string, payload: ActionRoleInput): Promise<unknown> {
    return this.prisma.rolePermission.create({ data: { roleId: id, permissionId: payload.permissionId } });
  }
}

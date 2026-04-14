import { Injectable } from "@nestjs/common";
import { RolesPermissionsRepository } from "../infrastructure/roles_permissions.repository";
import { ActionRoleInput, CreateRoleInput, RoleDto, UpdateRoleInput } from "../domain/roles_permissions.types";

@Injectable()
export class RolesPermissionsService {
  constructor(private readonly repository: RolesPermissionsRepository) {}

  list(): Promise<RoleDto[]> { return this.repository.list(); }
  get(id: string): Promise<RoleDto> { return this.repository.get(id); }
  create(data: CreateRoleInput): Promise<RoleDto> { return this.repository.create(data); }
  update(id: string, data: UpdateRoleInput): Promise<RoleDto> { return this.repository.update(id, data); }
  remove(id: string) { return this.repository.remove(id); }
  runAction(id: string, payload: ActionRoleInput): Promise<unknown> { return this.repository.runAction(id, payload); }
}

import { Module } from "@nestjs/common";
import { RolesPermissionsController } from "./presentation/roles_permissions.controller";
import { RolesPermissionsService } from "./application/roles_permissions.service";
import { RolesPermissionsRepository } from "./infrastructure/roles_permissions.repository";

@Module({
  controllers: [RolesPermissionsController],
  providers: [RolesPermissionsService, RolesPermissionsRepository],
})
export class RolesPermissionsModule {}

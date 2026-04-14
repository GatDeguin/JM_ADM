import { Injectable } from "@nestjs/common";
import { PackagingRepository } from "../infrastructure/packaging.repository";
import { ActionPackagingOrderInput, CreatePackagingOrderInput, PackagingOrderDto, UpdatePackagingOrderInput } from "../domain/packaging.types";

@Injectable()
export class PackagingService {
  constructor(private readonly repository: PackagingRepository) {}

  list(): Promise<PackagingOrderDto[]> { return this.repository.list(); }
  get(id: string): Promise<PackagingOrderDto> { return this.repository.get(id); }
  create(data: CreatePackagingOrderInput): Promise<PackagingOrderDto> { return this.repository.create(data); }
  update(id: string, data: UpdatePackagingOrderInput): Promise<PackagingOrderDto> { return this.repository.update(id, data); }
  remove(id: string) { return this.repository.remove(id); }
  runAction(id: string, payload: ActionPackagingOrderInput): Promise<PackagingOrderDto> { return this.repository.runAction(id, payload); }
}

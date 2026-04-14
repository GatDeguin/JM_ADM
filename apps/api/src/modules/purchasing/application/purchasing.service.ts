import { Injectable } from "@nestjs/common";
import { PurchasingRepository } from "../infrastructure/purchasing.repository";
import { ActionPurchaseOrderInput, CreatePurchaseOrderInput, PurchaseOrderDto, UpdatePurchaseOrderInput } from "../domain/purchasing.types";

@Injectable()
export class PurchasingService {
  constructor(private readonly repository: PurchasingRepository) {}

  list(): Promise<PurchaseOrderDto[]> { return this.repository.list(); }
  get(id: string): Promise<PurchaseOrderDto> { return this.repository.get(id); }
  create(data: CreatePurchaseOrderInput): Promise<PurchaseOrderDto> { return this.repository.create(data); }
  update(id: string, data: UpdatePurchaseOrderInput): Promise<PurchaseOrderDto> { return this.repository.update(id, data); }
  remove(id: string) { return this.repository.remove(id); }
  runAction(id: string, payload: ActionPurchaseOrderInput): Promise<PurchaseOrderDto> { return this.repository.runAction(id, payload); }
}

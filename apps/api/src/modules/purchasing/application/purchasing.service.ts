import { Injectable } from "@nestjs/common";
import { PurchasingRepository } from "../infrastructure/purchasing.repository";
import {
  ActionPurchaseOrderInput,
  CreateGoodsReceiptInput,
  CreatePurchaseOrderInput,
  CreatePurchaseRequestInput,
  GoodsReceiptDto,
  PurchaseOrderDto,
  PurchaseRequestDto,
  UpdatePurchaseOrderInput,
  UpdatePurchaseRequestInput,
} from "../domain/purchasing.types";

@Injectable()
export class PurchasingService {
  constructor(private readonly repository: PurchasingRepository) {}

  listRequests(): Promise<PurchaseRequestDto[]> { return this.repository.listRequests(); }
  getRequest(id: string): Promise<PurchaseRequestDto> { return this.repository.getRequest(id); }
  createRequest(data: CreatePurchaseRequestInput): Promise<PurchaseRequestDto> { return this.repository.createRequest(data); }
  updateRequest(id: string, data: UpdatePurchaseRequestInput): Promise<PurchaseRequestDto> { return this.repository.updateRequest(id, data); }
  approveRequest(id: string): Promise<PurchaseRequestDto> { return this.repository.approveRequest(id); }

  listOrders(): Promise<PurchaseOrderDto[]> { return this.repository.listOrders(); }
  getOrder(id: string): Promise<PurchaseOrderDto> { return this.repository.getOrder(id); }
  createOrder(data: CreatePurchaseOrderInput): Promise<PurchaseOrderDto> { return this.repository.createOrder(data); }
  updateOrder(id: string, data: UpdatePurchaseOrderInput): Promise<PurchaseOrderDto> { return this.repository.updateOrder(id, data); }
  removeOrder(id: string) { return this.repository.removeOrder(id); }
  runOrderAction(id: string, payload: ActionPurchaseOrderInput): Promise<PurchaseOrderDto> { return this.repository.runOrderAction(id, payload); }

  listReceipts(): Promise<GoodsReceiptDto[]> { return this.repository.listReceipts(); }
  getReceipt(id: string): Promise<GoodsReceiptDto> { return this.repository.getReceipt(id); }
  createReceipt(data: CreateGoodsReceiptInput): Promise<GoodsReceiptDto> { return this.repository.createReceipt(data); }
}

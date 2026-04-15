export type PurchaseRequestItemInput = {
  itemId: string;
  qty: number;
};

export type PurchaseRequestDto = {
  id: string;
  code: string;
  status: string;
  items?: Array<{
    id: string;
    itemId: string;
    qty: unknown;
    item?: { id: string; code: string; name: string };
  }>;
};

export type CreatePurchaseRequestInput = {
  code: string;
  status?: string;
  items: PurchaseRequestItemInput[];
};

export type UpdatePurchaseRequestInput = {
  status?: string;
};

export type PurchaseOrderItemInput = {
  itemId: string;
  qty: number;
  unitCost: number;
};

export type PurchaseOrderDto = {
  id: string;
  code: string;
  supplierId: string;
  status: string;
  supplier?: { id: string; code: string; name: string; status: string };
  items?: Array<{
    id: string;
    itemId: string;
    qty: unknown;
    unitCost: unknown;
    item?: { id: string; code: string; name: string };
  }>;
};

export type CreatePurchaseOrderInput = {
  code: string;
  supplierId: string;
  status?: string;
  requestId?: string;
  items: PurchaseOrderItemInput[];
};

export type UpdatePurchaseOrderInput = { status?: string };

export type ActionPurchaseOrderInput = {
  action: "approve" | "confirm";
};

export type GoodsReceiptItemInput = {
  itemId: string;
  qty: number;
  acceptedQty: number;
};

export type GoodsReceiptDifference = {
  itemId: string;
  orderedQty: number;
  previouslyAcceptedQty: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  remainingQtyVsOrder: number;
};

export type GoodsReceiptDto = {
  id: string;
  code: string;
  purchaseOrderId: string;
  status: string;
  accountsPayableId?: string;
  accountsPayableAmount?: number;
  differencesVsOrder: GoodsReceiptDifference[];
};

export type CreateGoodsReceiptInput = {
  code: string;
  purchaseOrderId: string;
  status?: string;
  items: GoodsReceiptItemInput[];
};

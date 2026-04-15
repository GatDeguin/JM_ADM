export const DOMAIN_EVENT_NAMES = {
  skuCreated: "catalog.sku.created",
  goodsReceiptRegistered: "purchasing.goods_receipt.registered",
  packagingClosed: "packaging.order.closed",
  stockAdjusted: "inventory.stock.adjusted",
  dispatchRegistered: "sales.dispatch.registered",
  receiptRegistered: "receivables.receipt.registered",
  paymentRegistered: "payables.payment.registered",
  monthlyCloseClosed: "costing.monthly_close.closed",
} as const;

export type DomainEventName = (typeof DOMAIN_EVENT_NAMES)[keyof typeof DOMAIN_EVENT_NAMES];

export type DomainEventPayloadByName = {
  [DOMAIN_EVENT_NAMES.skuCreated]: { skuId: string; code: string };
  [DOMAIN_EVENT_NAMES.goodsReceiptRegistered]: { goodsReceiptId: string; purchaseOrderId: string; accountsPayableId: string };
  [DOMAIN_EVENT_NAMES.packagingClosed]: { packagingOrderId: string; status: string };
  [DOMAIN_EVENT_NAMES.stockAdjusted]: { inventoryAdjustmentId: string; itemId: string; qty: number };
  [DOMAIN_EVENT_NAMES.dispatchRegistered]: { dispatchId: string; salesOrderId: string };
  [DOMAIN_EVENT_NAMES.receiptRegistered]: { receiptId: string; cashAccountId: string; amount: number };
  [DOMAIN_EVENT_NAMES.paymentRegistered]: { paymentId: string; cashAccountId: string; amount: number };
  [DOMAIN_EVENT_NAMES.monthlyCloseClosed]: { monthlyCloseId: string; status: string; closedAt: string };
};

export type DomainEventEnvelope<Name extends DomainEventName = DomainEventName> = {
  name: Name;
  occurredAt: string;
  payload: DomainEventPayloadByName[Name];
};

export function buildDomainEvent<Name extends DomainEventName>(
  name: Name,
  payload: DomainEventPayloadByName[Name],
): DomainEventEnvelope<Name> {
  return {
    name,
    occurredAt: new Date().toISOString(),
    payload,
  };
}

import { describe, expect, it, vi } from "vitest";
import { PurchasingService } from "../application/purchasing.service";
import { PurchasingRepository } from "../infrastructure/purchasing.repository";
import { DOMAIN_EVENT_NAMES } from "../../../common/events/domain-event-contract";

describe("purchasing integration", () => {
  it("gestiona solicitud, OC aprobada y recepción con CxP", async () => {
    const repo = {
      listRequests: vi.fn(),
      getRequest: vi.fn(),
      createRequest: vi.fn(async (data) => ({ id: "pr-1", status: "draft", ...data })),
      updateRequest: vi.fn(),
      approveRequest: vi.fn(async () => ({ id: "pr-1", status: "approved" })),
      listOrders: vi.fn(),
      getOrder: vi.fn(),
      createOrder: vi.fn(async (data) => ({ id: "po-1", status: "draft", ...data })),
      updateOrder: vi.fn(),
      removeOrder: vi.fn(),
      runOrderAction: vi.fn(async () => ({ id: "po-1", status: "approved" })),
      listReceipts: vi.fn(),
      getReceipt: vi.fn(),
      createReceipt: vi.fn(async () => ({ id: "gr-1", status: "received_partial", accountsPayableId: "ap-1" })),
    };

    const service = new PurchasingService(repo as never);

    const request = await service.createRequest({
      code: "SC-1",
      items: [{ itemId: "item-1", qty: 10 }],
    });
    const approvedRequest = await service.approveRequest("pr-1");

    const createdOrder = await service.createOrder({
      code: "PO-1",
      supplierId: "sup-1",
      requestId: request.id,
      items: [{ itemId: "item-1", qty: 10, unitCost: 125 }],
    });

    const approvedOrder = await service.runOrderAction("po-1", { action: "approve" });
    const receipt = await service.createReceipt({
      code: "GR-1",
      purchaseOrderId: "po-1",
      items: [{ itemId: "item-1", qty: 8, acceptedQty: 7 }],
    });

    expect(approvedRequest.status).toBe("approved");
    expect(createdOrder.code).toBe("PO-1");
    expect(approvedOrder.status).toBe("approved");
    expect(receipt.accountsPayableId).toBe("ap-1");
  });

  it("emite purchasing.goods_receipt.registered con payload mínimo", async () => {
    const emitted: unknown[] = [];
    const tx = {
      purchaseOrder: {
        findUniqueOrThrow: vi
          .fn()
          .mockResolvedValueOnce({
            id: "po-1",
            supplierId: "sup-1",
            status: "approved",
            PurchaseOrderItem: [{ itemId: "item-1", qty: 10, unitCost: 5 }],
          })
          .mockResolvedValueOnce({
            id: "po-1",
            PurchaseOrderItem: [{ itemId: "item-1", qty: 10 }],
            GoodsReceipt: [{ GoodsReceiptItem: [{ itemId: "item-1", acceptedQty: 10 }] }],
          }),
        update: vi.fn(async () => ({ id: "po-1" })),
      },
      goodsReceipt: {
        findMany: vi.fn(async () => []),
        create: vi.fn(async () => ({
          id: "gr-1",
          code: "GR-1",
          purchaseOrderId: "po-1",
          GoodsReceiptItem: [{ itemId: "item-1", qty: 10, acceptedQty: 10 }],
          purchaseOrder: { PurchaseOrderItem: [{ itemId: "item-1", qty: 10, unitCost: 5 }] },
        })),
        update: vi.fn(async () => ({ id: "gr-1" })),
      },
      stockMovement: { create: vi.fn(async () => ({ id: "sm-1" })) },
      stockBalance: {
        findFirst: vi.fn(async () => null),
        update: vi.fn(async () => ({ id: "sb-1" })),
        create: vi.fn(async () => ({ id: "sb-1" })),
      },
      accountsPayable: { create: vi.fn(async () => ({ id: "ap-1" })) },
      auditLog: { create: vi.fn(async () => ({ id: "audit-1" })) },
    };
    const repository = new PurchasingRepository(
      { $transaction: vi.fn(async (cb: (arg: typeof tx) => Promise<unknown>) => cb(tx)) } as never,
      { emit: (event: unknown) => emitted.push(event), on: () => undefined } as never,
    );

    await repository.createReceipt({
      code: "GR-1",
      purchaseOrderId: "po-1",
      items: [{ itemId: "item-1", qty: 10, acceptedQty: 10 }],
    });

    expect(emitted[0]).toMatchObject({
      name: DOMAIN_EVENT_NAMES.goodsReceiptRegistered,
      payload: { goodsReceiptId: "gr-1", purchaseOrderId: "po-1", accountsPayableId: "ap-1" },
    });
  });
});

export const workflowData = {
  catalog: {
    contextualProductName: "Producto Base Contextual QA",
    contextualProductCode: "PB-CTX-QA-01",
  },
  formula: { name: "Formula QA 2026", code: "F-QA-2026" },
  sku: {
    productName: "Producto Contextual QA",
    productCode: "PR-QA-01",
    skuName: "SKU Contextual QA",
    skuCode: "SKU-QA-01",
  },
  production: { orderName: "OP QA 2026", orderCode: "OP-QA-2026", lotId: "LOT-QA-2026" },
  fractioning: { name: "Fraccion QA", code: "FR-QA-01" },
  sales: {
    orderName: "Pedido QA",
    orderCode: "PED-QA-01",
    dispatchName: "Despacho QA",
    dispatchCode: "DSP-QA-01",
  },
  treasury: {
    receiptName: "Cobranza QA",
    receiptCode: "COB-QA-01",
    paymentName: "Pago QA",
    paymentCode: "PAG-QA-01",
  },
  importation: {
    homologationName: "Cliente Homologado QA",
    homologationCode: "HML-QA-01",
    importName: "Import QA",
    importCode: "IMP-QA-01",
  },
} as const;

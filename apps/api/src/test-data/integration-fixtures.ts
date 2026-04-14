export const integrationFixtures = {
  auth: {
    validEmail: "admin@demo.local",
    invalidEmail: "no-existe@demo.local",
    password: "secret",
  },
  catalog: {
    newProductBase: { code: "PB-100", name: "Base Concentrada" },
  },
  formulas: {
    activeFormulaId: "frm-active-v1",
    obsoleteFormulaId: "frm-obsolete-v0",
  },
  production: {
    orderCode: "OP-2026-0001",
    productBaseId: "pb-1",
    batchInProcessId: "batch-in-process",
    batchRetainedId: "batch-retained",
    responsible: "usr-qc-1",
    outputQty: 120,
  },
  sales: {
    orderCode: "SO-2026-0001",
    customerId: "cte-1",
    priceListId: "plist-1",
    skuId: "sku-1",
    total: 340,
  },
  finance: {
    itemId: "itm-1",
    qty: -4,
    reason: "Ajuste por conteo cíclico",
  },
  imports: {
    rows: [
      { codigo: " F-100 ", nombre: "Formula Base" },
      { codigo: "F-100", nombre: "Formula Base" },
      { codigo: "F-101", nombre: "Formula Lista", homologacion: "si" },
      { nombre: "Sin Código" },
    ],
  },
} as const;

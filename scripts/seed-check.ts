import { PrismaClient, EntityStatus } from "@prisma/client";

const prisma = new PrismaClient();

function assertCondition(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[seed-check] ${message}`);
  }
}

async function main() {
  const mandatoryAliases = [
    "ORO CREMA",
    "ORO LIQUIDO",
    "REJUVELAC",
    "SH OR",
    "SH OR 500",
    "AÇAÍ",
    "ORQUIDEA",
  ];

  const [
    users,
    roles,
    rolePermissions,
    aliases,
    productionOrder,
    batch,
    packagingOrder,
    stockMovement,
    salesOrder,
    receivable,
    receipt,
    payable,
    payment,
    costSnapshot,
    marginSnapshot,
  ] = await Promise.all([
    prisma.user.findMany({
      where: { email: { endsWith: "@demo.local" } },
      include: { roles: true },
    }),
    prisma.role.findMany({
      where: { name: { in: ["admin", "direccion", "produccion", "comercial", "finanzas"] } },
    }),
    prisma.rolePermission.findMany(),
    prisma.entityAlias.findMany({ where: { alias: { in: mandatoryAliases } } }),
    prisma.productionOrder.findFirst({ where: { code: "OP-2026-0001" } }),
    prisma.batch.findFirst({ where: { code: "LOT-BAL-OR-260401" } }),
    prisma.packagingOrder.findFirst({ where: { code: "OFR-2026-0001" } }),
    prisma.stockMovement.findFirst({ where: { id: "SMOV-001" } }),
    prisma.salesOrder.findFirst({ where: { code: "OV-2026-0001" } }),
    prisma.accountsReceivable.findFirst({ where: { id: "AR-001" } }),
    prisma.receipt.findFirst({ where: { code: "REC-2026-0001" } }),
    prisma.accountsPayable.findFirst({ where: { id: "AP-001" } }),
    prisma.payment.findFirst({ where: { code: "PAG-2026-0001" } }),
    prisma.costSnapshot.findFirst({ where: { key: "demo_e2e_costs_2026_04" } }),
    prisma.marginSnapshot.findFirst({ where: { key: "demo_e2e_margins_2026_04" } }),
  ]);

  assertCondition(users.length >= 5, "Deben existir usuarios demo por rol.");
  assertCondition(roles.length === 5, "Deben existir los 5 roles demo esperados.");
  assertCondition(
    rolePermissions.length >= 20,
    "La matriz de permisos no fue sembrada correctamente.",
  );

  for (const roleName of ["admin", "direccion", "produccion", "comercial", "finanzas"]) {
    const hasUserWithRole = users.some((user) => user.name === roleName && user.roles.length > 0);
    assertCondition(hasUserWithRole, `Falta usuario demo asignado al rol ${roleName}.`);
  }

  assertCondition(
    aliases.length === mandatoryAliases.length,
    "Faltan alias obligatorios del diccionario.",
  );
  const pending = aliases.filter((alias) => alias.status === EntityStatus.pending_homologation);
  assertCondition(pending.length >= 3, "Faltan casos ambiguos con pending_homologation.");

  assertCondition(
    Boolean(productionOrder && batch && packagingOrder && stockMovement),
    "Flujo OP + batch + fraccionamiento + stock incompleto.",
  );
  assertCondition(
    Boolean(salesOrder && receivable && receipt),
    "Flujo venta + cobranza incompleto.",
  );
  assertCondition(Boolean(payable && payment), "Flujo pago a proveedor incompleto.");
  assertCondition(Boolean(costSnapshot && marginSnapshot), "Faltan datos de costos/reportes.");

  console.log("✅ seed-check OK");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

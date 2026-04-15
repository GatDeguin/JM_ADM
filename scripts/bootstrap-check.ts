import { EntityStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_USERS = [
  "admin@demo.local",
  "direccion@demo.local",
  "produccion@demo.local",
  "comercial@demo.local",
  "finanzas@demo.local",
] as const;

const MIN_FAMILIES = [
  "Shampoo",
  "Acondicionador / Bálsamo",
  "Baño de crema",
  "Líquidos",
  "Cremas",
  "Máscara",
  "Tratamiento en crema",
  "Protector térmico / Leave-in",
  "Crema de peinar",
  "Ampolla",
  "Aceite / Sérum",
  "Perfume capilar",
  "Coloración",
] as const;

const MIN_VARIANTS = ["Oro", "Cherry", "Rejuvelac", "Purple Plex"] as const;
const MIN_PRESENTATIONS = ["granel", "1L", "500ML", "250ML", "120ml", "30ML"] as const;

const REQUIRED_ALIASES = ["ORO CREMA", "ORO LIQUIDO", "REJUVELAC", "SH OR", "SH OR 500", "AÇAÍ", "ORQUIDEA"] as const;

function assertCondition(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[bootstrap-check] ${message}`);
  }
}

function assertMissing(scope: string, required: readonly string[], existing: string[]) {
  const missing = required.filter((value) => !existing.includes(value));
  assertCondition(missing.length === 0, `Faltan ${scope}: ${missing.join(", ")}`);
}

async function main() {
  const [
    users,
    families,
    variants,
    presentations,
    aliases,
    productionOrder,
    batch,
    salesOrder,
    receipt,
    payment,
  ] = await Promise.all([
    prisma.user.findMany({ where: { email: { in: [...DEMO_USERS] } }, select: { email: true } }),
    prisma.family.findMany({ select: { name: true } }),
    prisma.variant.findMany({ select: { name: true } }),
    prisma.presentation.findMany({ select: { name: true } }),
    prisma.entityAlias.findMany({
      where: { alias: { in: [...REQUIRED_ALIASES] } },
      select: { alias: true, status: true, originalValue: true },
    }),
    prisma.productionOrder.findFirst({ where: { code: "OP-2026-0001" } }),
    prisma.batch.findFirst({ where: { code: "LOT-BAL-OR-260401" } }),
    prisma.salesOrder.findFirst({ where: { code: "OV-2026-0001" } }),
    prisma.receipt.findFirst({ where: { code: "REC-2026-0001" } }),
    prisma.payment.findFirst({ where: { code: "PAG-2026-0001" } }),
  ]);

  assertMissing(
    "usuarios demo",
    DEMO_USERS,
    users.map((user) => user.email),
  );

  assertMissing(
    "familias mínimas",
    MIN_FAMILIES,
    families.map((family) => family.name),
  );

  assertMissing(
    "variantes mínimas",
    MIN_VARIANTS,
    variants.map((variant) => variant.name),
  );

  assertMissing(
    "presentaciones mínimas",
    MIN_PRESENTATIONS,
    presentations.map((presentation) => presentation.name),
  );

  assertMissing(
    "alias obligatorios",
    REQUIRED_ALIASES,
    aliases.map((alias) => alias.alias),
  );

  const pendingAliasCount = aliases.filter(
    (alias) => alias.status === EntityStatus.pending_homologation,
  ).length;
  assertCondition(pendingAliasCount >= 3, "Deben existir al menos 3 alias pending_homologation.");

  const aliasesWithOriginalValueMismatch = aliases.filter(
    (alias) => alias.alias !== alias.originalValue,
  );
  assertCondition(
    aliasesWithOriginalValueMismatch.length === 0,
    "Hay alias obligatorios sin preservar originalValue.",
  );

  assertCondition(Boolean(productionOrder), "Falta la OP demo OP-2026-0001.");
  assertCondition(Boolean(batch), "Falta el lote demo LOT-BAL-OR-260401.");
  assertCondition(Boolean(salesOrder), "Falta la venta demo OV-2026-0001.");
  assertCondition(Boolean(receipt), "Falta el recibo demo REC-2026-0001.");
  assertCondition(Boolean(payment), "Falta el pago demo PAG-2026-0001.");

  console.log("✅ bootstrap-check OK");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

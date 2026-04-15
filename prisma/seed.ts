import {
  PrismaClient,
  EntityStatus,
  FormulaStatus,
  ProductionStatus,
  SalesStatus,
  AccountStatus,
  ImportStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo1234";

async function upsertByName<T extends { name: string }>(
  data: T[],
  upsert: (name: string) => Promise<unknown>,
) {
  for (const row of data) {
    await upsert(row.name);
  }
}

async function main() {
  const roles = ["admin", "direccion", "produccion", "comercial", "finanzas"];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  const users = roles.map((name) => ({
    email: `${name}@demo.local`,
    name,
    passwordHash: DEMO_PASSWORD,
    status: EntityStatus.active,
  }));

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, status: user.status },
      create: user,
    });
  }

  const units = [
    { code: "KG", name: "Kilogramo" },
    { code: "L", name: "Litro" },
    { code: "UN", name: "Unidad" },
    { code: "ML", name: "Mililitro" },
    { code: "G", name: "Gramo" },
  ];
  for (const unit of units) {
    await prisma.unit.upsert({
      where: { code: unit.code },
      update: { name: unit.name, status: EntityStatus.active },
      create: { ...unit, status: EntityStatus.active },
    });
  }

  const families = [
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
    "Barber",
    "Coloración",
    "Insumos base",
    "Activos",
    "Fragancias",
    "Packaging",
  ];
  await upsertByName(
    families.map((name) => ({ name })),
    (name) =>
      prisma.family.upsert({
        where: { name },
        update: { status: EntityStatus.active },
        create: { name },
      }),
  );

  const lines = [
    "Cherry",
    "Oro",
    "Coco",
    "Açaí",
    "Savia",
    "Ácido Hialurónico",
    "Anti Frizz",
    "Caviar",
    "Aloe & Palta",
    "Romero & Ortiga",
    "Jazmín & Miel",
    "Almendras",
    "Purple Plex",
    "Biotina",
    "Keratina",
    "Botox",
    "Glow Up",
    "Rejuvelac",
    "Baño de Seda",
    "Lifting Oro",
    "Vainilla & Coco",
    "Células Madre",
    "Restructure",
    "Black",
    "Barber",
    "Argán",
    "Macadamia",
    "Neutral",
  ];
  await upsertByName(
    lines.map((name) => ({ name })),
    (name) =>
      prisma.line.upsert({
        where: { name },
        update: { status: EntityStatus.active },
        create: { name },
      }),
  );

  const variants = [
    "Cherry",
    "Oro",
    "Coco",
    "Açaí",
    "Savia",
    "Ácido",
    "Anti Frizz",
    "Caviar",
    "Aloe y Palta",
    "Romero y Ortiga",
    "Jazmín y Miel",
    "Almendras",
    "Purple Plex",
    "Biotina",
    "Keratina",
    "Botox",
    "Glow Up",
    "Rejuvelac",
    "Baño de Seda",
    "Lifting Oro",
    "Vainilla y Coco",
    "Células Madre",
    "Restructure",
    "Black",
    "Barber",
    "Argán",
    "Macadamia",
    "Neutral",
  ];
  await upsertByName(
    variants.map((name) => ({ name })),
    (name) =>
      prisma.variant.upsert({
        where: { name },
        update: { status: EntityStatus.active },
        create: { name },
      }),
  );

  const familyByName = new Map(
    (await prisma.family.findMany()).map((x) => [x.name, x.id]),
  );
  const lineByName = new Map(
    (await prisma.line.findMany()).map((x) => [x.name, x.id]),
  );
  const variantByName = new Map(
    (await prisma.variant.findMany()).map((x) => [x.name, x.id]),
  );

  const productBases = [
    ["PB-SHA-CH", "Shampoo Cherry", "Shampoo", "Cherry", "Cherry"],
    ["PB-BAL-OR", "Bálsamo Oro", "Acondicionador / Bálsamo", "Oro", "Oro"],
    ["PB-BCR-OR", "Baño de Crema Oro", "Baño de crema", "Oro", "Oro"],
    [
      "PB-BCR-VC",
      "Baño de Crema Vainilla & Coco",
      "Baño de crema",
      "Vainilla & Coco",
      "Vainilla y Coco",
    ],
    [
      "PB-MAS-PP",
      "Máscara Purple Plex",
      "Máscara",
      "Purple Plex",
      "Purple Plex",
    ],
    [
      "PB-TRC-BX",
      "Tratamiento Botox en Crema",
      "Tratamiento en crema",
      "Botox",
      "Botox",
    ],
    [
      "PB-PTL-OR",
      "Protector Térmico Oro Líquido",
      "Protector térmico / Leave-in",
      "Oro",
      "Oro",
    ],
    ["PB-CPN-SV", "Crema de Peinar Savia", "Crema de peinar", "Savia", "Savia"],
    ["PB-AMP-RJ", "Ampolla Rejuvelac", "Ampolla", "Rejuvelac", "Rejuvelac"],
    ["PB-ACE-CV", "Aceite Caviar Puntas", "Aceite / Sérum", "Caviar", "Caviar"],
    [
      "PB-ACE-AM",
      "Sérum Almendras",
      "Aceite / Sérum",
      "Almendras",
      "Almendras",
    ],
    [
      "PB-PFC-GU",
      "Perfume Capilar Glow Up",
      "Perfume capilar",
      "Glow Up",
      "Glow Up",
    ],
    [
      "PB-PFC-JM",
      "Perfume Capilar Jazmín & Miel",
      "Perfume capilar",
      "Jazmín & Miel",
      "Jazmín y Miel",
    ],
    ["PB-LIQ-AR", "Líquido Capilar Argán", "Líquidos", "Argán", "Argán"],
    [
      "PB-LIQ-RM",
      "Loción Romero & Ortiga",
      "Líquidos",
      "Romero & Ortiga",
      "Romero y Ortiga",
    ],
    [
      "PB-CRE-MD",
      "Crema Capilar Macadamia",
      "Cremas",
      "Macadamia",
      "Macadamia",
    ],
    [
      "PB-CRE-CM",
      "Crema Capilar Células Madre",
      "Cremas",
      "Células Madre",
      "Células Madre",
    ],
    ["PB-BRB-BK", "Shampoo Barber Black", "Barber", "Barber", "Black"],
    ["PB-SHA-AC", "Shampoo Açaí", "Shampoo", "Açaí", "Açaí"],
    [
      "PB-SHA-AL",
      "Shampoo Aloe & Palta",
      "Shampoo",
      "Aloe & Palta",
      "Aloe y Palta",
    ],
    [
      "PB-SHA-RS",
      "Shampoo Restructure",
      "Shampoo",
      "Restructure",
      "Restructure",
    ],
    [
      "PB-COL-PP",
      "Matizador Purple Plex",
      "Coloración",
      "Purple Plex",
      "Purple Plex",
    ],
    [
      "PB-COL-BS",
      "Baño de Seda Matizador",
      "Coloración",
      "Baño de Seda",
      "Baño de Seda",
    ],
    [
      "PB-ACT-AH",
      "Activo Ácido Hialurónico",
      "Activos",
      "Ácido Hialurónico",
      "Ácido",
    ],
    ["PB-FRA-NE", "Fragancia Neutral", "Fragancias", "Neutral", "Neutral"],
    ["PB-INS-NB", "Base Neutra", "Insumos base", "Neutral", "Neutral"],
  ] as const;

  for (const [code, name, family, line, variant] of productBases) {
    await prisma.productBase.upsert({
      where: { code },
      update: {
        name,
        familyId: familyByName.get(family),
        lineId: lineByName.get(line),
        variantId: variantByName.get(variant),
        status: EntityStatus.active,
      },
      create: {
        code,
        name,
        familyId: familyByName.get(family),
        lineId: lineByName.get(line),
        variantId: variantByName.get(variant),
        status: EntityStatus.active,
      },
    });
  }

  const unitByCode = new Map(
    (await prisma.unit.findMany()).map((x) => [x.code, x.id]),
  );
  const presentations = [
    ["granel", "KG", "1"],
    ["5L", "L", "5"],
    ["1L", "L", "1"],
    ["500ML", "ML", "500"],
    ["250ML", "ML", "250"],
    ["200ml", "ML", "200"],
    ["120ml", "ML", "120"],
    ["60ml", "ML", "60"],
    ["30ML", "ML", "30"],
    ["unidad", "UN", "1"],
    ["pack", "UN", "6"],
    ["combo", "UN", "3"],
    ["caja", "UN", "12"],
  ] as const;

  for (const [name, unitCode, factor] of presentations) {
    await prisma.presentation.upsert({
      where: { name },
      update: {
        unitId: unitByCode.get(unitCode),
        factor,
        status: EntityStatus.active,
      },
      create: {
        name,
        unitId: unitByCode.get(unitCode),
        factor,
        status: EntityStatus.active,
      },
    });
  }

  const userByEmail = new Map(
    (await prisma.user.findMany()).map((x) => [x.email, x.id]),
  );
  const pbByCode = new Map(
    (await prisma.productBase.findMany()).map((x) => [x.code, x.id]),
  );
  const presentationByName = new Map(
    (await prisma.presentation.findMany()).map((x) => [x.name, x.id]),
  );

  const skus = [
    ["SKU-SHA-CH-500", "PB-SHA-CH", "500ML", "7790000000010"],
    ["SKU-SHA-CH-1000", "PB-SHA-CH", "1L", "7790000000030"],
    ["SKU-BAL-OR-500", "PB-BAL-OR", "500ML", "7790000000011"],
    ["SKU-BCR-OR-1000", "PB-BCR-OR", "1L", "7790000000012"],
    ["SKU-BCR-VC-1000", "PB-BCR-VC", "1L", "7790000000031"],
    ["SKU-MAS-PP-250", "PB-MAS-PP", "250ML", "7790000000013"],
    ["SKU-TRC-BX-250", "PB-TRC-BX", "250ML", "7790000000014"],
    ["SKU-PTL-OR-120", "PB-PTL-OR", "120ml", "7790000000015"],
    ["SKU-CPN-SV-250", "PB-CPN-SV", "250ML", "7790000000016"],
    ["SKU-AMP-RJ-30", "PB-AMP-RJ", "30ML", "7790000000017"],
    ["SKU-ACE-CV-60", "PB-ACE-CV", "60ml", "7790000000018"],
    ["SKU-ACE-AM-60", "PB-ACE-AM", "60ml", "7790000000032"],
    ["SKU-PFC-GU-120", "PB-PFC-GU", "120ml", "7790000000019"],
    ["SKU-PFC-JM-120", "PB-PFC-JM", "120ml", "7790000000033"],
    ["SKU-LIQ-AR-1000", "PB-LIQ-AR", "1L", "7790000000020"],
    ["SKU-LIQ-RM-1000", "PB-LIQ-RM", "1L", "7790000000034"],
    ["SKU-CRE-MD-250", "PB-CRE-MD", "250ML", "7790000000021"],
    ["SKU-CRE-CM-250", "PB-CRE-CM", "250ML", "7790000000035"],
    ["SKU-BRB-BK-500", "PB-BRB-BK", "500ML", "7790000000022"],
    ["SKU-SHA-AC-500", "PB-SHA-AC", "500ML", "7790000000036"],
    ["SKU-SHA-AL-500", "PB-SHA-AL", "500ML", "7790000000037"],
    ["SKU-SHA-RS-500", "PB-SHA-RS", "500ML", "7790000000038"],
    ["SKU-COL-PP-250", "PB-COL-PP", "250ML", "7790000000023"],
    ["SKU-COL-BS-250", "PB-COL-BS", "250ML", "7790000000039"],
    ["SKU-ACT-AH-200", "PB-ACT-AH", "200ml", "7790000000040"],
    ["SKU-FRA-NE-30", "PB-FRA-NE", "30ML", "7790000000041"],
    ["SKU-INS-NB-GRA", "PB-INS-NB", "granel", "7790000000042"],
    ["SKU-BAL-OR-PACK", "PB-BAL-OR", "pack", "7790000000024"],
    ["SKU-PFC-GU-COMBO", "PB-PFC-GU", "combo", "7790000000025"],
    ["SKU-SHA-CH-CAJA", "PB-SHA-CH", "caja", "7790000000026"],
    ["SKU-SHA-CH-GRA", "PB-SHA-CH", "granel", "7790000000027"],
  ] as const;

  for (const [code, pbCode, presentation, barcode] of skus) {
    await prisma.sKU.upsert({
      where: { code },
      update: {
        productBaseId: pbByCode.get(pbCode)!,
        presentationId: presentationByName.get(presentation)!,
        barcode,
        status: EntityStatus.active,
      },
      create: {
        code,
        productBaseId: pbByCode.get(pbCode)!,
        presentationId: presentationByName.get(presentation)!,
        barcode,
        status: EntityStatus.active,
      },
    });
  }

  const familyByNormalized = new Map(
    (await prisma.family.findMany()).map((x) => [x.name.toUpperCase(), x.id]),
  );
  const lineByNormalized = new Map(
    (await prisma.line.findMany()).map((x) => [x.name.toUpperCase(), x.id]),
  );
  const variantByNormalized = new Map(
    (await prisma.variant.findMany()).map((x) => [x.name.toUpperCase(), x.id]),
  );
  const presentationByNormalized = new Map(
    (await prisma.presentation.findMany()).map((x) => [
      x.name.toUpperCase(),
      x.id,
    ]),
  );
  const skuByNormalized = new Map(
    (await prisma.sKU.findMany()).map((x) => [x.code.toUpperCase(), x.id]),
  );

  const aliases = [
    [
      "family",
      "ENJUAGUE",
      "Acondicionador / Bálsamo",
      "Acondicionador / Bálsamo",
      EntityStatus.active,
      "ENJUAGUE",
    ],
    [
      "family",
      "LIQUIDO",
      "Líquidos",
      "Líquidos",
      EntityStatus.active,
      "LIQUIDO",
    ],
    [
      "family",
      "TRATAMIENTO CREMA",
      "Tratamiento en crema",
      "Tratamiento en crema",
      EntityStatus.active,
      "TRATAMIENTO CREMA",
    ],
    [
      "family",
      "SERUM",
      "Aceite / Sérum",
      "Aceite / Sérum",
      EntityStatus.active,
      "SERUM",
    ],
    ["line", "ARGAN", "Argán", "Argán", EntityStatus.active, "ARGAN"],
    [
      "line",
      "ACIDO HIALURONICO",
      "Ácido Hialurónico",
      "Ácido Hialurónico",
      EntityStatus.active,
      "ACIDO HIALURONICO",
    ],
    [
      "line",
      "ROMERO Y ORTIGA",
      "Romero & Ortiga",
      "Romero & Ortiga",
      EntityStatus.active,
      "ROMERO Y ORTIGA",
    ],
    [
      "line",
      "JAZMIN Y MIEL",
      "Jazmín & Miel",
      "Jazmín & Miel",
      EntityStatus.active,
      "JAZMIN Y MIEL",
    ],
    [
      "line",
      "LIFTING",
      null,
      "Lifting Oro",
      EntityStatus.pending_homologation,
      "LIFTING",
    ],
    ["variant", "ACAI", "Açaí", "Açaí", EntityStatus.active, "ACAI"],
    [
      "variant",
      "AÇAÍ",
      null,
      "Açaí",
      EntityStatus.pending_homologation,
      "AÇAÍ",
    ],
    [
      "variant",
      "ALOE PALTA",
      "Aloe y Palta",
      "Aloe y Palta",
      EntityStatus.active,
      "ALOE PALTA",
    ],
    [
      "variant",
      "ORQUIDEA",
      null,
      null,
      EntityStatus.pending_homologation,
      "ORQUIDEA",
    ],
    ["presentation", "500", "500ML", "500ML", EntityStatus.active, "500"],
    ["presentation", "1LT", "1L", "1L", EntityStatus.active, "1LT"],
    ["presentation", "120 ML", "120ml", "120ml", EntityStatus.active, "120 ML"],
    [
      "presentation",
      "GRANEL KG",
      "granel",
      "granel",
      EntityStatus.active,
      "GRANEL KG",
    ],
    [
      "product_base",
      "ORO CREMA",
      null,
      "Tratamiento Oro en Crema",
      EntityStatus.pending_homologation,
      "ORO CREMA",
    ],
    [
      "product_base",
      "ORO LIQ",
      "PB-PTL-OR",
      "Protector Térmico Oro Líquido",
      EntityStatus.active,
      "ORO LIQUIDO",
    ],
    [
      "product_base",
      "LEVANTA MUERTOS",
      null,
      "Ampolla Rejuvelac",
      EntityStatus.pending_homologation,
      "LEVANTA MUERTOS",
    ],
    [
      "product_base",
      "BANO ORO",
      "PB-BCR-OR",
      "Baño de Crema Oro",
      EntityStatus.active,
      "BANO ORO",
    ],
    [
      "product_base",
      "SH OR",
      null,
      "Shampoo Oro",
      EntityStatus.pending_homologation,
      "SH OR",
    ],
    [
      "product_base",
      "SERUM ALMENDRA",
      "PB-ACE-AM",
      "Sérum Almendras",
      EntityStatus.active,
      "SERUM ALMENDRA",
    ],
    [
      "product_base",
      "LOCION ROMERO",
      "PB-LIQ-RM",
      "Loción Romero & Ortiga",
      EntityStatus.active,
      "LOCION ROMERO",
    ],
    [
      "product_base",
      "PERFUME JAZMIN",
      "PB-PFC-JM",
      "Perfume Capilar Jazmín & Miel",
      EntityStatus.active,
      "PERFUME JAZMIN",
    ],
    [
      "sku",
      "SH CH 500",
      "SKU-SHA-CH-500",
      "SKU-SHA-CH-500",
      EntityStatus.active,
      "SH CH 500",
    ],
    [
      "sku",
      "BAL OR 500",
      "SKU-BAL-OR-500",
      "SKU-BAL-OR-500",
      EntityStatus.active,
      "BAL OR 500",
    ],
    [
      "sku",
      "PP MATIZ 250",
      "SKU-COL-PP-250",
      "SKU-COL-PP-250",
      EntityStatus.active,
      "PP MATIZ 250",
    ],
    [
      "sku",
      "SH OR 500",
      null,
      "SKU SHAMPOO ORO 500",
      EntityStatus.pending_homologation,
      "SH OR 500",
    ],
    [
      "sku",
      "BOTOX ORO 250",
      null,
      "SKU BOTOX ORO 250",
      EntityStatus.pending_homologation,
      "BOTOX ORO 250",
    ],
  ] as const;

  const canonicalIdResolver = (
    entityType: string,
    canonicalCode: string | null,
  ) => {
    if (!canonicalCode) return null;
    if (entityType === "product_base")
      return pbByCode.get(canonicalCode) ?? null;
    if (entityType === "family")
      return familyByNormalized.get(canonicalCode.toUpperCase()) ?? null;
    if (entityType === "line")
      return lineByNormalized.get(canonicalCode.toUpperCase()) ?? null;
    if (entityType === "variant")
      return variantByNormalized.get(canonicalCode.toUpperCase()) ?? null;
    if (entityType === "presentation")
      return presentationByNormalized.get(canonicalCode.toUpperCase()) ?? null;
    if (entityType === "sku")
      return skuByNormalized.get(canonicalCode.toUpperCase()) ?? null;
    return null;
  };

  for (const [
    entityType,
    alias,
    canonicalCode,
    canonicalName,
    status,
    originalValue,
  ] of aliases) {
    await prisma.entityAlias.upsert({
      where: { id: `${entityType}:${alias}` },
      update: {
        canonicalId: canonicalIdResolver(entityType, canonicalCode),
        canonicalName,
        status,
        originalValue,
      },
      create: {
        id: `${entityType}:${alias}`,
        entityType,
        alias,
        canonicalId: canonicalIdResolver(entityType, canonicalCode),
        canonicalName,
        status,
        originalValue,
      },
    });
  }

  const suppliers = [
    ["SUP-QUIM", "Quimipack SA"],
    ["SUP-FRAG", "Fragancias del Sur"],
    ["SUP-ENV", "Envaplast Industrial"],
  ] as const;
  for (const [code, name] of suppliers) {
    await prisma.supplier.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
  }

  const customers = [
    ["CLI-001", "Distribuidora Norte"],
    ["CLI-002", "Salón Estilo Centro"],
    ["CLI-003", "Mayorista Cabellos SA"],
  ] as const;
  for (const [code, name] of customers) {
    await prisma.customer.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
  }

  const warehouses = ["Central", "Producción", "Producto Terminado"];
  for (const name of warehouses) {
    await prisma.warehouse.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const cashAccounts = [
    ["Caja ARS", "cash"],
    ["Banco Corriente", "bank"],
  ] as const;
  for (const [name, type] of cashAccounts) {
    await prisma.cashAccount.upsert({
      where: { name },
      update: { type },
      create: { name, type },
    });
  }

  const priceLists = [
    ["PL-MAY", "Mayorista Abril 2026", new Date("2026-04-01T00:00:00Z")],
    ["PL-SAL", "Salones Abril 2026", new Date("2026-04-01T00:00:00Z")],
  ] as const;
  for (const [code, name, startsAt] of priceLists) {
    await prisma.priceList.upsert({
      where: { code },
      update: { name, startsAt },
      create: { code, name, startsAt },
    });
  }

  const skuByCode = new Map(
    (await prisma.sKU.findMany()).map((x) => [x.code, x.id]),
  );
  const customerByCode = new Map(
    (await prisma.customer.findMany()).map((x) => [x.code, x.id]),
  );
  const supplierByCode = new Map(
    (await prisma.supplier.findMany()).map((x) => [x.code, x.id]),
  );
  const priceListByCode = new Map(
    (await prisma.priceList.findMany()).map((x) => [x.code, x.id]),
  );
  const cashByName = new Map(
    (await prisma.cashAccount.findMany()).map((x) => [x.name, x.id]),
  );
  const warehouseByName = new Map(
    (await prisma.warehouse.findMany()).map((x) => [x.name, x.id]),
  );

  for (const [code, listCode, skuCode, price] of [
    ["PLI-MAY-1", "PL-MAY", "SKU-SHA-CH-500", "3500"],
    ["PLI-MAY-2", "PL-MAY", "SKU-BAL-OR-500", "3700"],
    ["PLI-MAY-3", "PL-MAY", "SKU-BCR-OR-1000", "6900"],
    ["PLI-SAL-1", "PL-SAL", "SKU-SHA-CH-500", "3900"],
    ["PLI-SAL-2", "PL-SAL", "SKU-BAL-OR-500", "4100"],
    ["PLI-SAL-3", "PL-SAL", "SKU-PFC-GU-120", "4700"],
  ] as const) {
    await prisma.priceListItem.upsert({
      where: { id: code },
      update: {
        priceListId: priceListByCode.get(listCode)!,
        skuId: skuByCode.get(skuCode)!,
        price,
      },
      create: {
        id: code,
        priceListId: priceListByCode.get(listCode)!,
        skuId: skuByCode.get(skuCode)!,
        price,
      },
    });
  }

  for (const [id, customerCode, listCode] of [
    ["CPL-001", "CLI-001", "PL-MAY"],
    ["CPL-002", "CLI-002", "PL-SAL"],
    ["CPL-003", "CLI-003", "PL-MAY"],
  ] as const) {
    await prisma.customerPriceList.upsert({
      where: { id },
      update: {
        customerId: customerByCode.get(customerCode)!,
        priceListId: priceListByCode.get(listCode)!,
      },
      create: {
        id,
        customerId: customerByCode.get(customerCode)!,
        priceListId: priceListByCode.get(listCode)!,
      },
    });
  }

  const coreItems = [
    ["ITM-BAS-CET", "Base catiónica"],
    ["ITM-ACT-KER", "Activo keratina"],
    ["ITM-FRA-ORO", "Fragancia Oro"],
    ["ITM-ENV-500", "Envase 500ml"],
    ["ITM-ENV-1000", "Envase 1L"],
    ["ITM-ENV-250", "Envase 250ml"],
    ["ITM-ENV-200", "Envase 200ml"],
    ["ITM-ENV-120", "Envase 120ml"],
    ["ITM-ENV-60", "Envase 60ml"],
    ["ITM-ENV-30", "Envase 30ml"],
    ["ITM-ENV-GRA", "Contenedor granel"],
    ["ITM-TAP-500", "Tapa flip-top 500ml"],
    ["ITM-TAP-1000", "Tapa rosca 1L"],
    ["ITM-TAP-250", "Tapa 250ml"],
    ["ITM-TAP-200", "Tapa 200ml"],
    ["ITM-TAP-120", "Tapa 120ml"],
    ["ITM-TAP-60", "Tapa 60ml"],
    ["ITM-TAP-30", "Tapa 30ml"],
    ["ITM-VAL-120", "Válvula spray 120ml"],
    ["ITM-VAL-30", "Válvula atomizadora 30ml"],
    ["ITM-ETQ-ORO", "Etiqueta línea Oro"],
    ["ITM-ETQ-CH", "Etiqueta línea Cherry"],
    ["ITM-ETQ-PP", "Etiqueta línea Purple Plex"],
    ["ITM-ETQ-CV", "Etiqueta línea Caviar"],
    ["ITM-ETQ-GU", "Etiqueta línea Glow Up"],
    ["ITM-ETQ-GEN", "Etiqueta línea genérica"],
    ["ITM-CAJA-IND", "Caja individual"],
    ["ITM-CAJA-6", "Caja pack x6"],
    ["ITM-CAJA-12", "Caja master x12"],
    ["ITM-PACK-MASTER", "Pack master corrugado"],
    ["ITM-SKU-SHA-CH-500", "SKU físico Shampoo Cherry 500ml"],
    ["ITM-SKU-BAL-OR-500", "SKU físico Bálsamo Oro 500ml"],
  ] as const;
  for (const [code, name] of coreItems) {
    await prisma.item.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
  }
  const itemByCode = new Map(
    (await prisma.item.findMany()).map((x) => [x.code, x.id]),
  );

  const packagingSpecBySku = [
    ["SKU-SHA-CH-500", "envase", "ITM-ENV-500", "1"],
    ["SKU-SHA-CH-500", "tapa", "ITM-TAP-500", "1"],
    ["SKU-SHA-CH-500", "etiqueta", "ITM-ETQ-CH", "1"],
    ["SKU-SHA-CH-500", "caja", "ITM-CAJA-IND", "1"],
    ["SKU-SHA-CH-500", "pack_master", "ITM-PACK-MASTER", "0.0833"],
    ["SKU-SHA-CH-1000", "envase", "ITM-ENV-1000", "1"],
    ["SKU-SHA-CH-1000", "tapa", "ITM-TAP-1000", "1"],
    ["SKU-SHA-CH-1000", "etiqueta", "ITM-ETQ-CH", "1"],
    ["SKU-SHA-CH-1000", "caja", "ITM-CAJA-IND", "1"],
    ["SKU-SHA-CH-1000", "pack_master", "ITM-PACK-MASTER", "0.0833"],
    ["SKU-BAL-OR-500", "envase", "ITM-ENV-500", "1"],
    ["SKU-BAL-OR-500", "tapa", "ITM-TAP-500", "1"],
    ["SKU-BAL-OR-500", "etiqueta", "ITM-ETQ-ORO", "1"],
    ["SKU-BAL-OR-500", "caja", "ITM-CAJA-IND", "1"],
    ["SKU-BAL-OR-500", "pack_master", "ITM-PACK-MASTER", "0.0833"],
    ["SKU-BCR-OR-1000", "envase", "ITM-ENV-1000", "1"],
    ["SKU-BCR-OR-1000", "tapa", "ITM-TAP-1000", "1"],
    ["SKU-BCR-OR-1000", "etiqueta", "ITM-ETQ-ORO", "1"],
    ["SKU-BCR-OR-1000", "caja", "ITM-CAJA-IND", "1"],
    ["SKU-BCR-OR-1000", "pack_master", "ITM-PACK-MASTER", "0.0833"],
    ["SKU-BCR-VC-1000", "envase", "ITM-ENV-1000", "1"],
    ["SKU-BCR-VC-1000", "tapa", "ITM-TAP-1000", "1"],
    ["SKU-BCR-VC-1000", "etiqueta", "ITM-ETQ-GEN", "1"],
    ["SKU-BCR-VC-1000", "caja", "ITM-CAJA-IND", "1"],
    ["SKU-BCR-VC-1000", "pack_master", "ITM-PACK-MASTER", "0.0833"],
    ["SKU-PFC-GU-120", "envase", "ITM-ENV-120", "1"],
    ["SKU-PFC-GU-120", "valvula", "ITM-VAL-120", "1"],
    ["SKU-PFC-GU-120", "etiqueta", "ITM-ETQ-GU", "1"],
    ["SKU-PFC-GU-120", "caja", "ITM-CAJA-IND", "1"],
    ["SKU-PFC-GU-120", "pack_master", "ITM-PACK-MASTER", "0.0833"],
    ["SKU-PFC-JM-120", "envase", "ITM-ENV-120", "1"],
    ["SKU-PFC-JM-120", "valvula", "ITM-VAL-120", "1"],
    ["SKU-PFC-JM-120", "etiqueta", "ITM-ETQ-GEN", "1"],
    ["SKU-PFC-JM-120", "caja", "ITM-CAJA-IND", "1"],
    ["SKU-PFC-JM-120", "pack_master", "ITM-PACK-MASTER", "0.0833"],
    ["SKU-ACE-CV-60", "envase", "ITM-ENV-60", "1"],
    ["SKU-ACE-CV-60", "tapa", "ITM-TAP-60", "1"],
    ["SKU-ACE-CV-60", "etiqueta", "ITM-ETQ-CV", "1"],
    ["SKU-ACE-AM-60", "envase", "ITM-ENV-60", "1"],
    ["SKU-ACE-AM-60", "tapa", "ITM-TAP-60", "1"],
    ["SKU-ACE-AM-60", "etiqueta", "ITM-ETQ-GEN", "1"],
    ["SKU-AMP-RJ-30", "envase", "ITM-ENV-30", "1"],
    ["SKU-AMP-RJ-30", "valvula", "ITM-VAL-30", "1"],
    ["SKU-AMP-RJ-30", "etiqueta", "ITM-ETQ-GEN", "1"],
    ["SKU-TRC-BX-250", "envase", "ITM-ENV-250", "1"],
    ["SKU-TRC-BX-250", "tapa", "ITM-TAP-250", "1"],
    ["SKU-TRC-BX-250", "etiqueta", "ITM-ETQ-ORO", "1"],
    ["SKU-MAS-PP-250", "envase", "ITM-ENV-250", "1"],
    ["SKU-MAS-PP-250", "tapa", "ITM-TAP-250", "1"],
    ["SKU-MAS-PP-250", "etiqueta", "ITM-ETQ-PP", "1"],
    ["SKU-COL-PP-250", "envase", "ITM-ENV-250", "1"],
    ["SKU-COL-PP-250", "tapa", "ITM-TAP-250", "1"],
    ["SKU-COL-PP-250", "etiqueta", "ITM-ETQ-PP", "1"],
    ["SKU-COL-BS-250", "envase", "ITM-ENV-250", "1"],
    ["SKU-COL-BS-250", "tapa", "ITM-TAP-250", "1"],
    ["SKU-COL-BS-250", "etiqueta", "ITM-ETQ-GEN", "1"],
    ["SKU-ACT-AH-200", "envase", "ITM-ENV-200", "1"],
    ["SKU-ACT-AH-200", "tapa", "ITM-TAP-200", "1"],
    ["SKU-ACT-AH-200", "etiqueta", "ITM-ETQ-GEN", "1"],
    ["SKU-INS-NB-GRA", "envase", "ITM-ENV-GRA", "1"],
    ["SKU-INS-NB-GRA", "etiqueta", "ITM-ETQ-GEN", "1"],
    ["SKU-BAL-OR-PACK", "caja", "ITM-CAJA-6", "1"],
    ["SKU-BAL-OR-PACK", "pack_master", "ITM-PACK-MASTER", "0.5"],
    ["SKU-PFC-GU-COMBO", "caja", "ITM-CAJA-IND", "3"],
    ["SKU-PFC-GU-COMBO", "pack_master", "ITM-PACK-MASTER", "0.25"],
    ["SKU-SHA-CH-CAJA", "caja", "ITM-CAJA-12", "1"],
    ["SKU-SHA-CH-CAJA", "pack_master", "ITM-PACK-MASTER", "1"],
  ] as const;

  for (const [skuCode, componentType, itemCode, qty] of packagingSpecBySku) {
    await prisma.packagingSpec.upsert({
      where: {
        skuId_componentType_itemId: {
          skuId: skuByCode.get(skuCode)!,
          componentType,
          itemId: itemByCode.get(itemCode)!,
        },
      },
      update: { qty },
      create: {
        skuId: skuByCode.get(skuCode)!,
        componentType,
        itemId: itemByCode.get(itemCode)!,
        qty,
      },
    });
  }

  await prisma.formulaTemplate.upsert({
    where: { code: "FOR-BAL-OR" },
    update: {
      name: "Fórmula Bálsamo Oro",
      familyId: familyByName.get("Acondicionador / Bálsamo"),
    },
    create: {
      code: "FOR-BAL-OR",
      name: "Fórmula Bálsamo Oro",
      familyId: familyByName.get("Acondicionador / Bálsamo"),
      status: FormulaStatus.approved,
    },
  });
  const formulaTemplate = await prisma.formulaTemplate.findUniqueOrThrow({
    where: { code: "FOR-BAL-OR" },
  });

  await prisma.formulaVersion.upsert({
    where: { id: "FVER-BAL-OR-1" },
    update: {
      templateId: formulaTemplate.id,
      version: 1,
      status: FormulaStatus.approved,
    },
    create: {
      id: "FVER-BAL-OR-1",
      templateId: formulaTemplate.id,
      version: 1,
      status: FormulaStatus.approved,
    },
  });

  await prisma.formulaComponent.deleteMany({
    where: { formulaVersionId: "FVER-BAL-OR-1" },
  });
  await prisma.formulaComponent.createMany({
    data: [
      {
        formulaVersionId: "FVER-BAL-OR-1",
        itemId: itemByCode.get("ITM-BAS-CET")!,
        qty: "85",
        unitId: unitByCode.get("KG")!,
      },
      {
        formulaVersionId: "FVER-BAL-OR-1",
        itemId: itemByCode.get("ITM-ACT-KER")!,
        qty: "5",
        unitId: unitByCode.get("KG")!,
      },
      {
        formulaVersionId: "FVER-BAL-OR-1",
        itemId: itemByCode.get("ITM-FRA-ORO")!,
        qty: "2",
        unitId: unitByCode.get("KG")!,
      },
    ],
  });

  await prisma.productionOrder.upsert({
    where: { code: "OP-2026-0001" },
    update: {
      productBaseId: pbByCode.get("PB-BAL-OR")!,
      formulaVersionId: "FVER-BAL-OR-1",
      plannedQty: "100",
      status: ProductionStatus.in_process,
    },
    create: {
      code: "OP-2026-0001",
      productBaseId: pbByCode.get("PB-BAL-OR")!,
      formulaVersionId: "FVER-BAL-OR-1",
      plannedQty: "100",
      status: ProductionStatus.in_process,
    },
  });

  const prodOrder = await prisma.productionOrder.findUniqueOrThrow({
    where: { code: "OP-2026-0001" },
  });
  await prisma.batch.upsert({
    where: { code: "LOT-BAL-OR-260401" },
    update: {
      productionOrderId: prodOrder.id,
      responsibleUserId: userByEmail.get(users[2].email),
      outputQty: "95",
      status: ProductionStatus.released,
    },
    create: {
      code: "LOT-BAL-OR-260401",
      productionOrderId: prodOrder.id,
      responsibleUserId: userByEmail.get(users[2].email),
      outputQty: "95",
      status: ProductionStatus.released,
    },
  });
  const batch = await prisma.batch.findUniqueOrThrow({
    where: { code: "LOT-BAL-OR-260401" },
  });

  await prisma.packagingOrder.upsert({
    where: { code: "OFR-2026-0001" },
    update: {
      parentBatchId: batch.id,
      skuId: skuByCode.get("SKU-BAL-OR-500")!,
      qty: "180",
      status: ProductionStatus.released,
    },
    create: {
      code: "OFR-2026-0001",
      parentBatchId: batch.id,
      skuId: skuByCode.get("SKU-BAL-OR-500")!,
      qty: "180",
      status: ProductionStatus.released,
    },
  });
  const packagingOrder = await prisma.packagingOrder.findUniqueOrThrow({
    where: { code: "OFR-2026-0001" },
  });

  await prisma.childBatch.upsert({
    where: { id: "CHILD-001" },
    update: {
      packagingOrderId: packagingOrder.id,
      lotCode: "FRAC-BAL-OR-260401-A",
      qty: "120",
    },
    create: {
      id: "CHILD-001",
      packagingOrderId: packagingOrder.id,
      lotCode: "FRAC-BAL-OR-260401-A",
      qty: "120",
    },
  });

  await prisma.childBatch.upsert({
    where: { id: "CHILD-002" },
    update: {
      packagingOrderId: packagingOrder.id,
      lotCode: "FRAC-BAL-OR-260401-B",
      qty: "60",
    },
    create: {
      id: "CHILD-002",
      packagingOrderId: packagingOrder.id,
      lotCode: "FRAC-BAL-OR-260401-B",
      qty: "60",
    },
  });

  await prisma.stockLot.upsert({
    where: { id: "SLOT-BAL-OR-A" },
    update: {
      itemId: itemByCode.get("ITM-SKU-BAL-OR-500")!,
      lotCode: "FRAC-BAL-OR-260401-A",
      warehouseId: warehouseByName.get("Producto Terminado")!,
    },
    create: {
      id: "SLOT-BAL-OR-A",
      itemId: itemByCode.get("ITM-SKU-BAL-OR-500")!,
      lotCode: "FRAC-BAL-OR-260401-A",
      warehouseId: warehouseByName.get("Producto Terminado")!,
    },
  });

  await prisma.stockBalance.upsert({
    where: { id: "SBAL-001" },
    update: {
      itemId: itemByCode.get("ITM-SKU-BAL-OR-500")!,
      warehouseId: warehouseByName.get("Producto Terminado")!,
      qty: "120",
      reservedQty: "20",
    },
    create: {
      id: "SBAL-001",
      itemId: itemByCode.get("ITM-SKU-BAL-OR-500")!,
      warehouseId: warehouseByName.get("Producto Terminado")!,
      qty: "120",
      reservedQty: "20",
    },
  });

  await prisma.stockMovement.upsert({
    where: { id: "SMOV-001" },
    update: {
      itemId: itemByCode.get("ITM-SKU-BAL-OR-500")!,
      lotId: "SLOT-BAL-OR-A",
      type: "IN",
      qty: "120",
      reason: "Fraccionamiento lote",
    },
    create: {
      id: "SMOV-001",
      itemId: itemByCode.get("ITM-SKU-BAL-OR-500")!,
      lotId: "SLOT-BAL-OR-A",
      type: "IN",
      qty: "120",
      reason: "Fraccionamiento lote",
    },
  });

  await prisma.purchaseOrder.upsert({
    where: { code: "OC-2026-0001" },
    update: { supplierId: supplierByCode.get("SUP-QUIM")!, status: "approved" },
    create: {
      code: "OC-2026-0001",
      supplierId: supplierByCode.get("SUP-QUIM")!,
      status: "approved",
    },
  });
  const po = await prisma.purchaseOrder.findUniqueOrThrow({
    where: { code: "OC-2026-0001" },
  });

  await prisma.purchaseOrderItem.upsert({
    where: { id: "POI-001" },
    update: {
      purchaseOrderId: po.id,
      itemId: itemByCode.get("ITM-BAS-CET")!,
      qty: "200",
      unitCost: "2.5",
    },
    create: {
      id: "POI-001",
      purchaseOrderId: po.id,
      itemId: itemByCode.get("ITM-BAS-CET")!,
      qty: "200",
      unitCost: "2.5",
    },
  });

  await prisma.goodsReceipt.upsert({
    where: { code: "RC-2026-0001" },
    update: { purchaseOrderId: po.id, status: "received" },
    create: {
      code: "RC-2026-0001",
      purchaseOrderId: po.id,
      status: "received",
    },
  });
  const receipt = await prisma.goodsReceipt.findUniqueOrThrow({
    where: { code: "RC-2026-0001" },
  });

  await prisma.goodsReceiptItem.upsert({
    where: { id: "GRI-001" },
    update: {
      goodsReceiptId: receipt.id,
      itemId: itemByCode.get("ITM-BAS-CET")!,
      qty: "200",
      acceptedQty: "198",
    },
    create: {
      id: "GRI-001",
      goodsReceiptId: receipt.id,
      itemId: itemByCode.get("ITM-BAS-CET")!,
      qty: "200",
      acceptedQty: "198",
    },
  });

  await prisma.salesOrder.upsert({
    where: { code: "OV-2026-0001" },
    update: {
      customerId: customerByCode.get("CLI-001")!,
      priceListId: priceListByCode.get("PL-MAY")!,
      status: SalesStatus.confirmed,
      total: "74000",
    },
    create: {
      code: "OV-2026-0001",
      customerId: customerByCode.get("CLI-001")!,
      priceListId: priceListByCode.get("PL-MAY")!,
      status: SalesStatus.confirmed,
      total: "74000",
    },
  });

  const so = await prisma.salesOrder.findUniqueOrThrow({
    where: { code: "OV-2026-0001" },
  });
  await prisma.salesOrderItem.upsert({
    where: { id: "SOI-001" },
    update: {
      salesOrderId: so.id,
      skuId: skuByCode.get("SKU-BAL-OR-500")!,
      qty: "20",
      unitPrice: "3700",
    },
    create: {
      id: "SOI-001",
      salesOrderId: so.id,
      skuId: skuByCode.get("SKU-BAL-OR-500")!,
      qty: "20",
      unitPrice: "3700",
    },
  });

  await prisma.accountsReceivable.upsert({
    where: { id: "AR-001" },
    update: {
      customerId: customerByCode.get("CLI-001")!,
      salesOrderId: so.id,
      dueDate: new Date("2026-04-30T00:00:00Z"),
      amount: "74000",
      balance: "24000",
      status: AccountStatus.partial,
    },
    create: {
      id: "AR-001",
      customerId: customerByCode.get("CLI-001")!,
      salesOrderId: so.id,
      dueDate: new Date("2026-04-30T00:00:00Z"),
      amount: "74000",
      balance: "24000",
      status: AccountStatus.partial,
    },
  });

  await prisma.receipt.upsert({
    where: { code: "REC-2026-0001" },
    update: {
      customerId: customerByCode.get("CLI-001")!,
      amount: "50000",
      cashAccountId: cashByName.get("Banco Corriente")!,
    },
    create: {
      code: "REC-2026-0001",
      customerId: customerByCode.get("CLI-001")!,
      amount: "50000",
      cashAccountId: cashByName.get("Banco Corriente")!,
    },
  });
  const moneyIn = await prisma.receipt.findUniqueOrThrow({
    where: { code: "REC-2026-0001" },
  });

  await prisma.receiptAllocation.upsert({
    where: { id: "RA-001" },
    update: { receiptId: moneyIn.id, receivableId: "AR-001", amount: "50000" },
    create: {
      id: "RA-001",
      receiptId: moneyIn.id,
      receivableId: "AR-001",
      amount: "50000",
    },
  });

  await prisma.accountsPayable.upsert({
    where: { id: "AP-001" },
    update: {
      supplierId: supplierByCode.get("SUP-QUIM")!,
      sourceType: "purchase_order",
      sourceId: po.id,
      dueDate: new Date("2026-04-20T00:00:00Z"),
      amount: "495",
      balance: "95",
      status: AccountStatus.partial,
    },
    create: {
      id: "AP-001",
      supplierId: supplierByCode.get("SUP-QUIM")!,
      sourceType: "purchase_order",
      sourceId: po.id,
      dueDate: new Date("2026-04-20T00:00:00Z"),
      amount: "495",
      balance: "95",
      status: AccountStatus.partial,
    },
  });

  await prisma.payment.upsert({
    where: { code: "PAG-2026-0001" },
    update: {
      supplierId: supplierByCode.get("SUP-QUIM")!,
      amount: "400",
      cashAccountId: cashByName.get("Caja ARS")!,
    },
    create: {
      code: "PAG-2026-0001",
      supplierId: supplierByCode.get("SUP-QUIM")!,
      amount: "400",
      cashAccountId: cashByName.get("Caja ARS")!,
    },
  });
  const payment = await prisma.payment.findUniqueOrThrow({
    where: { code: "PAG-2026-0001" },
  });

  await prisma.paymentAllocation.upsert({
    where: { id: "PA-001" },
    update: { paymentId: payment.id, payableId: "AP-001", amount: "400" },
    create: {
      id: "PA-001",
      paymentId: payment.id,
      payableId: "AP-001",
      amount: "400",
    },
  });

  await prisma.importJob.upsert({
    where: { id: "IMP-001" },
    update: {
      type: "aliases_bootstrap",
      status: ImportStatus.imported_with_warnings,
      sourceName: "demo_aliases_2026_04.csv",
      summary: {
        pendingHomologation: 6,
        total: 12,
        ambiguous: ["ORQUIDEA", "SH OR", "AÇAÍ"],
      },
    },
    create: {
      id: "IMP-001",
      type: "aliases_bootstrap",
      status: ImportStatus.imported_with_warnings,
      sourceName: "demo_aliases_2026_04.csv",
      summary: {
        pendingHomologation: 6,
        total: 12,
        ambiguous: ["ORQUIDEA", "SH OR", "AÇAÍ"],
      },
    },
  });

  await prisma.importJob.upsert({
    where: { id: "IMP-002" },
    update: {
      type: "operational_report_snapshot",
      status: ImportStatus.imported,
      sourceName: "connected_flow_report_2026_04.json",
      summary: {
        purchaseOrders: 1,
        productionOrders: 1,
        packagingOrders: 1,
        salesOrders: 1,
        collections: 1,
        payments: 1,
      },
    },
    create: {
      id: "IMP-002",
      type: "operational_report_snapshot",
      status: ImportStatus.imported,
      sourceName: "connected_flow_report_2026_04.json",
      summary: {
        purchaseOrders: 1,
        productionOrders: 1,
        packagingOrders: 1,
        salesOrders: 1,
        collections: 1,
        payments: 1,
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

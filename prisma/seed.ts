import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const roles = ["admin","direccion","produccion","comercial","finanzas"];
  for (const roleName of roles) {
    await prisma.role.upsert({ where:{name:roleName}, update:{}, create:{name:roleName} });
  }
  const users = ["admin","direccion","produccion","comercial","finanzas"];
  for (const u of users){
    await prisma.user.upsert({
      where:{email:`${u}@demo.local`},
      update:{},
      create:{email:`${u}@demo.local`,name:u,passwordHash:"demo1234"}
    });
  }
  const families = ["Baño de crema","Bálsamo / Enjuague","Shampoo","Protector / Líquido / Leave-in","Tratamiento en crema","Crema de peinar","Máscara","Ampolla","Aceite / sérum / puntas","Perfume capilar","Packaging","Insumos base","Insumos de color","Fragancias","Activos","Envases y etiquetas"];
  for (const name of families) await prisma.family.upsert({where:{name},update:{},create:{name}});
  const variants = ["Cherry","Oro","Coco","Açaí","Savia","Ácido","Anti Frizz","Caviar","Aloe y Palta","Romero y Ortiga","Jazmín y Miel","Almendras","Purple Plex","Barber","Black","Biotina","Keratina","Botox","Glow Up","Rejuvelac","Baño de Seda","Lifting Oro","Vainilla y Coco","Células Madre","Restructure"];
  for (const name of variants) await prisma.variant.upsert({where:{name},update:{},create:{name}});
  for (const p of ["granel","5L","1L","500ML","250ML","30ML","unidad","pack","combo","caja"]) await prisma.presentation.upsert({where:{name:p},update:{},create:{name:p}});
  const pb = ["Baño de crema Cherry","Baño de crema Oro","Baño de crema Coco","Baño de crema Açaí","Shampoo Cherry","Bálsamo Oro","Prot. Térmico Oro Líquido","Trat. Oro en Crema","Ampolla 4M","Perfume Capilar"];
  let i=1; for (const name of pb) await prisma.productBase.upsert({where:{code:`PB-${i++}`},update:{name},create:{code:`PB-${i-1}`,name}});
  await prisma.entityAlias.createMany({data:[
    {entityType:"product_base",alias:"ORO CREMA",canonicalName:"TRAT. ORO EN CREMA",originalValue:"ORO CREMA"},
    {entityType:"product_base",alias:"ORO LIQUIDO",canonicalName:"PROT. TÉRMICO ORO LÍQUIDO",originalValue:"ORO LIQUIDO"},
    {entityType:"product_base",alias:"REJUVELAC",canonicalName:"LEVANTA MUERTOS (REJUVELAC)",originalValue:"REJUVELAC"}
  ], skipDuplicates:true});
}

main().finally(()=>prisma.$disconnect());

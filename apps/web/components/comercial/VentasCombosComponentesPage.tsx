"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function VentasCombosComponentesPage() {
  return (
    <DomainResourcePage
      layoutTitle="Ventas · Combos"
      headerTitle="Combos y componentes"
      subtitle="Explosión de combos para ventas."
      listPath="/catalog/combos"
      createPath="/catalog/combos"
    />
  );
}

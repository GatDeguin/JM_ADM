"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function CombosPage() {
  return (
    <DomainResourcePage
      layoutTitle="Comercial · Combos"
      headerTitle="Combos"
      subtitle="Combos comerciales y componentes."
      listPath="/catalog/combos"
      createPath="/catalog/combos"
    />
  );
}

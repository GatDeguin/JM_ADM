"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function FormulasPage() {
  return (
    <DomainResourcePage
      layoutTitle="Técnica · Fórmulas"
      headerTitle="Fórmulas"
      subtitle="Catálogo de fórmulas con alta."
      listPath="/formulas"
      createPath="/formulas"
    />
  );
}

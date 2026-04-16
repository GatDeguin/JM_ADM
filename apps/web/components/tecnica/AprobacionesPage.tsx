"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function AprobacionesPage() {
  return (
    <DomainResourcePage
      layoutTitle="Técnica · Aprobaciones"
      headerTitle="Aprobaciones de fórmulas"
      subtitle="Pipeline de aprobación técnica."
      listPath="/formulas"
      createPath="/formulas"
    />
  );
}

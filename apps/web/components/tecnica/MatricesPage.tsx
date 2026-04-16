"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function MatricesPage() {
  return (
    <DomainResourcePage
      layoutTitle="Técnica · Matrices"
      headerTitle="Matrices de calidad"
      subtitle="Matriz de calidad y consistencia de datos."
      listPath="/reporting/data-quality/lists"
    />
  );
}

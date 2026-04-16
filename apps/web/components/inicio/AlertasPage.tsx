"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function AlertasPage() {
  return (
    <DomainResourcePage
      layoutTitle="Inicio · Alertas"
      headerTitle="Alertas"
      subtitle="Alertas operativas activas desde reporting de calidad."
      listPath="/reporting/data-quality"
    />
  );
}

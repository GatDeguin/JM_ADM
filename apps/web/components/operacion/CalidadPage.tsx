"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function CalidadPage() {
  return (
    <DomainResourcePage
      layoutTitle="Operación · Calidad"
      headerTitle="Calidad"
      subtitle="Registros QC con decisiones de calidad."
      listPath="/quality/qc-records"
      createPath="/quality/qc-records"
    />
  );
}

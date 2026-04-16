"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function InicioDashboardPage() {
  return (
    <DomainResourcePage
      layoutTitle="Inicio"
      headerTitle="Dashboard"
      subtitle="Indicadores operativos y financieros en tiempo real."
      listPath="/reporting/dashboard"
    />
  );
}

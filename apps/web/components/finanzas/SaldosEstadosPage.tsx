"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function SaldosEstadosPage() {
  return (
    <DomainResourcePage
      layoutTitle="Finanzas · Saldos y estados"
      headerTitle="Saldos y estados"
      subtitle="Estado financiero consolidado."
      listPath="/reporting/finance"
    />
  );
}

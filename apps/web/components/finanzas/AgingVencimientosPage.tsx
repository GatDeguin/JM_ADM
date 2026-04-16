"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function AgingVencimientosPage() {
  return (
    <DomainResourcePage
      layoutTitle="Cobranzas · Aging"
      headerTitle="Aging y vencimientos"
      subtitle="Agenda de vencimientos de CxC."
      listPath="/receivables/accounts-receivable/aging-agenda"
    />
  );
}

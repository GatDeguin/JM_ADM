"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function RecibosParcialesPage() {
  return (
    <DomainResourcePage
      layoutTitle="Cobranzas · Recibos parciales"
      headerTitle="Recibos parciales"
      subtitle="Recepción parcial con imputación posterior."
      listPath="/receivables/accounts-receivable"
      createPath="/receivables/receipts/apply"
    />
  );
}

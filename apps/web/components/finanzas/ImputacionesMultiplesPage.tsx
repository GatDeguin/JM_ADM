"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function ImputacionesMultiplesPage() {
  return (
    <DomainResourcePage
      layoutTitle="Cobranzas · Imputaciones múltiples"
      headerTitle="Imputaciones múltiples"
      subtitle="Aplicación de recibos en múltiples documentos."
      listPath="/receivables/accounts-receivable"
      createPath="/receivables/receipts/apply"
    />
  );
}

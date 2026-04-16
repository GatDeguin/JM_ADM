"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function AsignacionCxpPage() {
  return (
    <DomainResourcePage
      layoutTitle="Pagos/Tesorería · Asignación CxP"
      headerTitle="Asignación CxP"
      subtitle="Aplicación de pagos sobre CxP abiertas."
      listPath="/payables_treasury/accounts-payable"
      createPath="/payables_treasury/payments/apply"
    />
  );
}

"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function ConciliacionBancariaPage() {
  return (
    <DomainResourcePage
      layoutTitle="Pagos/Tesorería · Conciliación bancaria"
      headerTitle="Conciliación bancaria"
      subtitle="Registro de conciliación bancaria."
      listPath="/reporting/finance"
      createPath="/payables_treasury/bank-reconciliations/register"
    />
  );
}

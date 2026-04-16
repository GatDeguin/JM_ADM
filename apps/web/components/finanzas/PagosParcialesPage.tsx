"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function PagosParcialesPage() {
  return (
    <DomainResourcePage
      layoutTitle="Pagos/Tesorería · Pagos parciales"
      headerTitle="Pagos parciales"
      subtitle="Registro de pagos parciales."
      listPath="/payables_treasury/accounts-payable"
      createPath="/payables_treasury/payments/register"
    />
  );
}

"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function TesoreriaPage() {
  return (
    <DomainResourcePage
      layoutTitle="Finanzas · Tesorería"
      headerTitle="Tesorería"
      subtitle="Caja, banco y flujo financiero."
      listPath="/finance/cash-flow"
      createPath="/finance/treasury/transfers/register"
    />
  );
}

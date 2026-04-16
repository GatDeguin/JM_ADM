"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function ConciliacionPage() {
  return (
    <DomainResourcePage
      layoutTitle="Finanzas · Conciliación"
      headerTitle="Conciliación bancaria"
      subtitle="Conciliación y control de extractos."
      listPath="/reporting/finance"
      createPath="/finance/bank-reconciliation/register"
    />
  );
}

"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function CuentasCobrarPage() {
  return (
    <DomainResourcePage
      layoutTitle="Finanzas · Cuentas por cobrar"
      headerTitle="Cuentas por cobrar"
      subtitle="Gestión de cartera y cobranza."
      listPath="/receivables/accounts-receivable"
      createPath="/receivables/accounts-receivable"
    />
  );
}

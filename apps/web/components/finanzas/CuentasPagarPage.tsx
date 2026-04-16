"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function CuentasPagarPage() {
  return (
    <DomainResourcePage
      layoutTitle="Finanzas · Cuentas por pagar"
      headerTitle="Cuentas por pagar"
      subtitle="Gestión de obligaciones con proveedores."
      listPath="/payables_treasury/accounts-payable"
      createPath="/payables_treasury/accounts-payable"
    />
  );
}

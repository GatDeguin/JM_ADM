"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function MovimientosCajaBancoPage() {
  return (
    <DomainResourcePage
      layoutTitle="Pagos/Tesorería · Movimientos caja/banco"
      headerTitle="Movimientos caja/banco"
      subtitle="Transferencias entre cuentas de tesorería."
      listPath="/finance/cash-flow"
      createPath="/payables_treasury/treasury/transfers/register"
    />
  );
}

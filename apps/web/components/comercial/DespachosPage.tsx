"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function DespachosPage() {
  return (
    <DomainResourcePage
      layoutTitle="Comercial · Despachos"
      headerTitle="Despachos"
      subtitle="Órdenes de despacho y devoluciones."
      listPath="/sales/sales-orders"
      createPath="/sales/dispatch-orders"
    />
  );
}

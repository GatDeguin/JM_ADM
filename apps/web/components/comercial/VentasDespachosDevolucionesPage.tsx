"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function VentasDespachosDevolucionesPage() {
  return (
    <DomainResourcePage
      layoutTitle="Ventas · Despachos y devoluciones"
      headerTitle="Despachos y devoluciones"
      subtitle="Flujo comercial de despacho/devolución."
      listPath="/sales/sales-orders"
      createPath="/sales/sales-returns"
    />
  );
}

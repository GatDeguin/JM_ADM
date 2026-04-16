"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function HistorialLotesPage() {
  return (
    <DomainResourcePage
      layoutTitle="Operación · Historial de lotes"
      headerTitle="Historial de lotes"
      subtitle="Trazabilidad de movimientos por lote."
      listPath="/inventory/movements/traceability"
    />
  );
}

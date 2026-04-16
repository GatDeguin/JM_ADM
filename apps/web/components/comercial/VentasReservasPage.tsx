"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function VentasReservasPage() {
  return (
    <DomainResourcePage
      layoutTitle="Ventas · Reservas"
      headerTitle="Reservas de stock"
      subtitle="Disponibilidad y reservas operativas."
      listPath="/inventory/stock-availability"
      createPath="/inventory/transfers/register"
    />
  );
}

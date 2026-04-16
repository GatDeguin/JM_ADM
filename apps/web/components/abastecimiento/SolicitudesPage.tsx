"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function SolicitudesPage() {
  return (
    <DomainResourcePage
      layoutTitle="Abastecimiento · Solicitudes"
      headerTitle="Solicitudes de compra"
      subtitle="Solicitudes conectadas a purchasing v1."
      listPath="/purchasing/purchase-requests"
      createPath="/purchasing/purchase-requests"
    />
  );
}

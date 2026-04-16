"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function CostosProveedorPage() {
  return (
    <DomainResourcePage
      layoutTitle="Abastecimiento · Costos proveedor"
      headerTitle="Costos por proveedor"
      subtitle="Cierres y costos mensuales para análisis de proveedor."
      listPath="/costing/monthly-closes"
      createPath="/costing/monthly-closes"
    />
  );
}

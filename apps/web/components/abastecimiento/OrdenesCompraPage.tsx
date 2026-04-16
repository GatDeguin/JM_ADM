"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function OrdenesCompraPage() {
  return (
    <DomainResourcePage
      layoutTitle="Abastecimiento · Órdenes de compra"
      headerTitle="Órdenes de compra"
      subtitle="Órdenes de compra conectadas al backend real."
      listPath="/purchasing/purchase-orders"
      createPath="/purchasing/purchase-orders"
    />
  );
}

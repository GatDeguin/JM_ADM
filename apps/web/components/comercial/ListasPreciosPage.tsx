"use client";

import { DomainResourcePage } from "@/components/ui/DomainResourcePage";

export function ListasPreciosPage() {
  return (
    <DomainResourcePage
      layoutTitle="Comercial · Listas"
      headerTitle="Listas de precios"
      subtitle="Listas de precios vigentes."
      listPath="/pricing/price-lists"
      createPath="/pricing/price-lists"
    />
  );
}
